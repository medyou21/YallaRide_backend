const Trip = require("../models/Trip");
const Reservation = require("../models/Reservation");
const Review = require("../models/Review");

// ------------------ Créer un trajet ------------------

exports.createTrip = async (req, res) => {
  try {
    const trip = new Trip({
      ...req.body,
      driverId: req.user.id, // 🔥 depuis JWT
    });

    await trip.save();
    res.status(201).json(trip);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};
// ------------------ Récupérer tous les trajets ------------------
exports.getTrips = async (req, res) => {
  try {
    const { departureCity, arrivalCity, date, passengers } = req.query;
    const filter = {};

    // Filtrage insensible à la casse
    if (departureCity) filter.departureCity = { $regex: new RegExp(departureCity, "i") };
    if (arrivalCity) filter.arrivalCity = { $regex: new RegExp(arrivalCity, "i") };

    if (passengers) filter.seatsAvailable = { $gte: Number(passengers) };

    // Filtrage par date
    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);
      filter.date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Récupération des trajets avec conducteur
    const trips = await Trip.find(filter)
      .populate("driverId") // toutes les infos du conducteur
      .lean(); // .lean() pour récupérer des objets JS simples

    // Pour chaque trajet, ajouter les réservations et avis
    const tripsWithDetails = await Promise.all(trips.map(async (trip) => {
      // Réservations pour ce trajet
      const reservations = await Reservation.find({ tripId: trip._id })
        .populate("passengerId", "name email phone")
        .lean();

      // Avis pour ce conducteur
      const reviews = await Review.find({ reviewedUserId: trip.driverId._id })
        .populate("reviewerId", "name")
        .lean();

      return {
        ...trip,
        reservations,
        reviews,
      };
    }));

    res.json(tripsWithDetails);

  } catch (err) {
    console.error("Erreur getTrips:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------ Récupérer un trajet par ID ------------------
exports.getTripById = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate("driverId").lean();
    if (!trip) return res.status(404).json({ error: "Trajet non trouvé" });

    // Réservations et avis
    const reservations = await Reservation.find({ tripId: trip._id })
      .populate("passengerId", "name email phone")
      .lean();

    const reviews = await Review.find({ reviewedUserId: trip.driverId._id })
      .populate("reviewerId", "name")
      .lean();

    res.json({
      ...trip,
      reservations,
      reviews,
    });

  } catch (err) {
    console.error("Erreur getTripById:", err);
    res.status(500).json({ error: err.message });
  }
};

// ------------------ Mettre à jour un trajet ------------------
exports.updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!trip) return res.status(404).json({ error: "Trajet non trouvé" });
    res.json(trip);
  } catch (err) {
    console.error("Erreur updateTrip:", err);
    res.status(400).json({ error: err.message });
  }
};

// ------------------ Supprimer un trajet ------------------
exports.deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) return res.status(404).json({ error: "Trajet non trouvé" });
    res.json({ message: "Trajet supprimé" });
  } catch (err) {
    console.error("Erreur deleteTrip:", err);
    res.status(500).json({ error: err.message });
  }
};


// Récupérer les trajets d’un conducteur
exports.getTripsByDriver = async (req, res) => {
  try {
    const driverId = req.user.id; // récupéré depuis JWT
    const trips = await Trip.find({ driverId });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};