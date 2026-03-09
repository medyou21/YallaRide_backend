const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Import routes
const userRoutes = require("./routes/userRoutes");
const tripRoutes = require("./routes/tripRoutes");
const reservationRoutes = require("./routes/reservationRoutes");
const messageRoutes = require("./routes/messageRoutes");
const reviewRoutes = require("./routes/reviewRoutes");

// Utilisation des routes
app.use("/api/users", userRoutes);
app.use("/api/trips", tripRoutes);
app.use("/api/reservations", reservationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/reviews", reviewRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("API YallaRide fonctionne !");
});

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI, {
 
}).then(() => console.log("Connecté à MongoDB"))
  .catch(err => console.log(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));