const Reservation = require("../models/Reservation");
const Trip = require("../models/Trip");

// 🔹 Créer une réservation (passager)
exports.createReservation = async (req, res) => {
  try {
    const reservation = new Reservation({
      tripId: req.body.tripId,
      passengerId: req.user.id, // utilisateur connecté
      seatsBooked: req.body.seatsBooked,
    });
    await reservation.save();

    // 🔹 Émettre l'événement Socket.io pour le conducteur
    const io = req.app.get("io");
    io.to(req.body.tripId).emit("newReservation", reservation);

    res.status(201).json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 🔹 Récupérer les réservations du passager connecté
exports.getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({ passengerId: req.user.id })
      .populate({
        path: "tripId",
        select: "departureCity arrivalCity date time price driverId",
        populate: { path: "driverId", select: "name _id" }
      })
      .populate("passengerId", "name email");
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Récupérer les réservations d’un trajet pour le conducteur
exports.getReservationsByTrip = async (req, res) => {
  try {
    const reservations = await Reservation.find({ tripId: req.params.tripId })
      .populate("passengerId", "name email phone")
      .populate("tripId", "departureCity arrivalCity date time");
    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Récupérer toutes les réservations pour un conducteur (nouvelle route)
exports.getReservationsByDriver = async (req, res) => {
  try {
    const driverId = req.user.id;

    // Récupérer tous les trajets du conducteur
    const trips = await Trip.find({ driverId }).select("_id");

    const tripIds = trips.map(t => t._id);

    // Récupérer toutes les réservations de ces trajets
    const reservations = await Reservation.find({ tripId: { $in: tripIds } })
      .populate("passengerId", "name email phone")
      .populate("tripId", "departureCity arrivalCity date time");

    res.json(reservations);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// 🔹 Mettre à jour le statut d’une réservation (confirmé / annulé)
exports.updateStatus = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndUpdate(
      req.params.id,
      { status: req.body.status },
      { new: true }
    );
    if (!reservation) return res.status(404).json({ error: "Réservation non trouvée" });

    // 🔹 Notifier en temps réel le passager
    const io = req.app.get("io");
    io.to(reservation.tripId.toString()).emit("reservationStatusChanged", reservation);

    res.json(reservation);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// 🔹 Supprimer une réservation

exports.deleteReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findByIdAndDelete(req.params.id);
    if (!reservation) return res.status(404).json({ error: "Réservation non trouvée" });

    const io = req.app.get("io");

    io.to(reservation.tripId.toString()).emit("reservationCanceled", {
      reservationId: reservation._id,
      tripId: reservation.tripId,
    });

    res.json({ message: "Réservation supprimée" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};