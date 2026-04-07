require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

// ---------------- ROUTES ----------------
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const tripRoutes = require("./routes/tripRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// ---------------- MIDDLEWARE ----------------
const authMiddleware = require("./middleware/authMiddleware");

// ---------------- MODELS ----------------
const Message = require("./models/Message");

// ---------------- APP ----------------
const app = express();

// ---------------- CORS ----------------
app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.1.12:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// ---------------- SERVER ----------------
const server = http.createServer(app);

// ---------------- SOCKET.IO ----------------
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.1.12:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"],
});

// rendre io accessible dans les controllers
app.set("io", io);

// ---------------- MONGODB ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connecté"))
  .catch((err) => console.error("❌ MongoDB error:", err));

// ---------------- ROUTES ----------------
// publiques
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app
// protégées
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/trips", authMiddleware, tripRoutes);
app.use("/api/reservations", authMiddleware, reservationRoutes);
app.use("/api/messages", authMiddleware, messageRoutes);
app.use("/api/reviews", authMiddleware, reviewRoutes);

app.get("/", (req, res) => {
  res.send("🚀 YallaRide API + Socket.IO OK");
});

// ---------------- SOCKET AUTH ----------------
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;

    if (!token) return next(new Error("No token"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;

    next();
  } catch (err) {
    console.error("❌ Socket Auth Error:", err.message);
    next(new Error("Auth error"));
  }
});

// ---------------- SOCKET LOGIC ----------------
let onlineUsers = new Map();

io.on("connection", (socket) => {
  const userId = socket.user.id.toString();

  console.log("✅ Connected:", userId);

  // 🔹 utilisateur en ligne
  onlineUsers.set(userId, socket.id);
  io.emit("onlineUsers", Array.from(onlineUsers.keys()));

  // 🔹 room user (notifications direct)
  socket.join(userId);

  // 🔹 rejoindre un trajet
  socket.on("joinRoom", (tripId) => {
    if (!tripId) return;

    socket.join(tripId.toString());
    console.log(`📡 ${userId} a rejoint trip ${tripId}`);
  });

  // 🔹 envoyer message
  socket.on("sendMessage", async (data) => {
    try {
      if (!data?.tripId || !data?.message) return;

      const message = new Message({
        senderId: userId,
        receiverId: data.receiverId,
        tripId: data.tripId,
        message: data.message,
      });

      await message.save();

      const payload = {
        ...message.toObject(),
        senderName: data.senderName || "Utilisateur",
      };

      console.log("📩 Message:", payload);

      io.to(data.tripId.toString()).emit("receiveMessage", payload);

    } catch (err) {
      console.error("❌ sendMessage error:", err.message);
    }
  });

  // 🔹 typing
  socket.on("typing", ({ tripId }) => {
    if (!tripId) return;

    socket
      .to(tripId.toString())
      .emit("userTyping", { userId });
  });

  socket.on("stopTyping", ({ tripId }) => {
    if (!tripId) return;

    socket
      .to(tripId.toString())
      .emit("userStopTyping", { userId });
  });

  // 🔹 nouvelles réservations
  socket.on("newReservation", (reservation) => {
    if (!reservation?.tripId) return;

    io.to(reservation.tripId.toString()).emit(
      "newReservation",
      reservation
    );
  });

  // 🔹 changement statut réservation
  socket.on("reservationStatusChanged", (reservation) => {
    if (!reservation?.passengerId) return;

    io.to(reservation.passengerId.toString()).emit(
      "reservationStatusChanged",
      reservation
    );
  });

  // 🔹 disconnect
  socket.on("disconnect", () => {
    console.log("❌ Disconnected:", userId);

    onlineUsers.delete(userId);

    io.emit("onlineUsers", Array.from(onlineUsers.keys()));
  });
});

// ---------------- START ----------------
const PORT = process.env.PORT || 5000;

server.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});