const express = require("express");
const router = express.Router();
const reservationController = require("../controllers/reservationController");
const authMiddleware = require("../middleware/authMiddleware");

// Création réservation (passager)
router.post("/", authMiddleware, reservationController.createReservation);

// Réservations du passager connecté
router.get("/my", authMiddleware, reservationController.getMyReservations);

// Réservations pour un trajet spécifique (conducteur)
router.get("/trip/:tripId", authMiddleware, reservationController.getReservationsByTrip);

// 🔹 Nouvelle route : toutes les réservations du conducteur
router.get("/driver", authMiddleware, reservationController.getReservationsByDriver);

// Mettre à jour le statut
router.patch("/:id/status", authMiddleware, reservationController.updateStatus);

// Supprimer réservation
router.delete("/:id", authMiddleware, reservationController.deleteReservation);

module.exports = router;