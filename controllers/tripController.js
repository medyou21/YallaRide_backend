const Trip = require("../models/Trip");
const User = require("../models/User");

// Créer un trajet
exports.createTrip = async (req, res) => {
  try {
    const trip = new Trip(req.body);
    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer tous les trajets avec info conducteur
exports.getTrips = async (req, res) => {
  try {
    const trips = await Trip.find().populate("driverId", "name email phone");
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Récupérer un trajet par ID
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate("driverId", "name email phone");
    if(!trip) return res.status(404).json({ error: "Trajet non trouvé" });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Modifier un trajet
exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if(!trip) return res.status(404).json({ error: "Trajet non trouvé" });
    res.json(trip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer un trajet
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if(!trip) return res.status(404).json({ error: "Trajet non trouvé" });
    res.json({ message: "Trajet supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};