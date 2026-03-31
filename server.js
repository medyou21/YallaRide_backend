require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");

// ---------------- ROUTES ----------------
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes"); // Login / Register / Refresh
const tripRoutes = require("./routes/tripRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// ---------------- MIDDLEWARE ----------------
const authMiddleware = require("./middleware/authMiddleware");

// ---------------- MODELS ----------------
const Message = require("./models/Message");
const Reservation = require("./models/Reservation");

// ---------------- INIT APP ----------------
const app = express();

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://192.168.1.12:3000"],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);
app.use(express.json());

// ---------------- SERVER SOCKET.IO ----------------
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://192.168.1.12:3000"],
    methods: ["GET", "POST"],
    credentials: true,
  },
  transports: ["websocket"], // 🔹 forcer websocket uniquement
});

// Permettre l’accès à io dans les controllers
app.set("io", io);

// ---------------- MONGODB ----------------
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connecté à MongoDB"))
  .catch((err) => console.error("❌ Erreur MongoDB :", err));

// ---------------- ROUTES ----------------
// Auth routes publiques
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // register/login ici

// Routes protégées
app.use("/api/users", authMiddleware, userRoutes);
app.use("/api/trips", authMiddleware, tripRoutes);
app.use("/api/reservations", authMiddleware, reservationRoutes);
app.use("/api/messages", authMiddleware, messageRoutes);
app.use("/api/reviews", authMiddleware, reviewRoutes);

app.get("/", (req, res) => res.send("🚗 API YallaRide fonctionne !"));

// ---------------- SOCKET.IO ----------------

// Auth JWT pour Socket.IO
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Auth token manquant"));

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded; // { id, role }
    next();
  } catch (err) {
    console.error("❌ Socket Auth Error:", err.message);
    next(new Error("Token invalide"));
  }
});

// Connexion socket
io.on("connection", (socket) => {
  console.log("✅ Socket connecté :", socket.id, "User:", socket.user.id);

  // 🔹 ROOM UTILISATEUR (IMPORTANT 🔔)
  socket.join(socket.user.id.toString());

  // 🔹 JOIN ROOM TRAJET
  socket.on("joinRoom", (tripId) => {
    if (!tripId) return;

    const room = tripId.toString();
    socket.join(room);

    console.log(`📡 User ${socket.user.id} joined trip ${room}`);
  });

  // 🔹 CHAT TEMPS RÉEL
  socket.on("sendMessage", async (data) => {
    try {
      if (!data.tripId || !data.message) return;

      const message = new Message({
        senderId: socket.user.id,
        receiverId: data.receiverId,
        tripId: data.tripId,
        message: data.message,
      });

      await message.save();

      // 🔥 envoyer à la room du trajet
      io.to(data.tripId.toString()).emit("receiveMessage", {
        ...message.toObject(),
        senderName: data.senderName || "Utilisateur",
      });

    } catch (err) {
      console.error("❌ sendMessage error:", err.message);
    }
  });

  // 🔹 NOTIFICATION NOUVELLE RESERVATION
  socket.on("newReservation", (reservation) => {
    try {
      if (!reservation?.tripId) return;

      io.to(reservation.tripId.toString()).emit("newReservation", reservation);

    } catch (err) {
      console.error("❌ newReservation error:", err.message);
    }
  });

  // 🔹 CHANGEMENT STATUS
  socket.on("reservationStatusChanged", (reservation) => {
    try {
      if (!reservation?.passengerId) return;

      // 🔔 envoyer direct au passager
      io.to(reservation.passengerId.toString()).emit(
        "reservationStatusChanged",
        reservation
      );

    } catch (err) {
      console.error("❌ status error:", err.message);
    }
  });

  // 🔹 DECONNEXION
  socket.on("disconnect", (reason) => {
    console.log(`❌ Socket disconnected (${socket.user.id}) :`, reason);
  });

  // 🔹 ERREUR SOCKET
  socket.on("error", (err) => {
    console.error("❌ Socket error :", err);
  });
});

// ---------------- SERVER ----------------
const PORT = process.env.PORT || 5000;
server.listen(PORT, "0.0.0.0", () =>
  console.log(`🚀 Serveur lancé sur http://0.0.0.0:${PORT}`)
);