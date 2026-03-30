const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");
const authMiddleware = require("../middleware/authMiddleware"); // si tu utilises JWT

// 🔹 Récupérer les trajets du conducteur connecté
router.get("/driver", authMiddleware, tripController.getTripsByDriver);
// GET /api/trips => récupérer tous les trajets avec filtres facultatifs
router.get("/", tripController.getTrips);

// GET /api/trips/:id => récupérer un trajet par ID
router.get("/:id", tripController.getTripById);

// POST /api/trips => créer un nouveau trajet
router.post("/", authMiddleware, tripController.createTrip);

// PUT /api/trips/:id => mettre à jour un trajet
router.put("/:id", tripController.updateTrip);

// DELETE /api/trips/:id => supprimer un trajet
router.delete("/:id", tripController.deleteTrip);

module.exports = router;