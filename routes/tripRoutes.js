const express = require("express");
const router = express.Router();
const tripController = require("../controllers/tripController");

// CRUD Trajets
router.post("/", tripController.createTrip);
router.get("/", tripController.getTrips);
router.get("/:id", tripController.getTripById);
router.put("/:id", tripController.updateTrip);
router.delete("/:id", tripController.deleteTrip);

module.exports = router;