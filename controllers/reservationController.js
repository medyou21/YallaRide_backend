const Reservation = require("../models/Reservation");

// Créer une réservation
exports.createReservation = async (req, res) => {
  try {
    const reservation = new Reservation(req.body);
    await reservation.save();
    res.status(201).json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer toutes les réservations avec infos passager et trajet
exports.getReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find()
      .populate("tripId")
      .populate("passengerId", "name email phone");
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Modifier une réservation
exports.updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if(!reservation) return res.status(404).json({ error: "Réservation non trouvée" });
    res.json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Supprimer une réservation
exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if(!reservation) return res.status(404).json({ error: "Réservation non trouvée" });
    res.json({ message: "Réservation supprimée" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("tripId")
      .populate("passengerId", "name email");
    if(!reservation) return res.status(404).json({ error: "Réservation non trouvée" });
    res.json(reservation);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};