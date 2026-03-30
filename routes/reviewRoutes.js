const express = require("express");
const router = express.Router();
const Review = require("../models/Review");

// 🔥 CREATE REVIEW
router.post("/", async (req, res) => {
  try {
    const { reviewerId, reviewedUserId, tripId, rating, comment } = req.body;

    // ✅ Validation
    if (!reviewerId || !reviewedUserId || !tripId) {
      return res.status(400).json({ message: "Données manquantes" });
    }

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating invalide" });
    }

    // ❌ Empêcher double avis pour le même trajet
    const existing = await Review.findOne({
      reviewerId,
      tripId,
    });

    if (existing) {
      return res.status(400).json({
        message: "Avis déjà donné pour ce trajet",
      });
    }

    const review = new Review({
      reviewerId,
      reviewedUserId,
      tripId,
      rating,
      comment,
    });

    await review.save();

    res.status(201).json(review);

  } catch (err) {
    console.error("Erreur create review :", err);

    res.status(500).json({
      message: "Erreur serveur",
    });
  }
});

// 🔥 GET REVIEWS PAR TRAJET
router.get("/trip/:tripId", async (req, res) => {
  try {
    const reviews = await Review.find({
      tripId: req.params.tripId,
    }).populate("reviewerId", "name");

    res.json(reviews);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Erreur récupération avis",
    });
  }
});

// 🔥 GET REVIEWS PAR UTILISATEUR (conducteur)
router.get("/driver/:id", async (req, res) => {
  try {
    const reviews = await Review.find({
      reviewedUserId: req.params.id,
    }).populate("reviewerId", "name");

    res.json(reviews);

  } catch (err) {
    res.status(500).json({
      message: "Erreur récupération avis",
    });
  }
});

// 🔥 MOYENNE DES NOTES
router.get("/rating/:id", async (req, res) => {
  try {
    const reviews = await Review.find({
      reviewedUserId: req.params.id,
    });

    const total = reviews.length;

    const avg =
      total > 0
        ? reviews.reduce((acc, r) => acc + r.rating, 0) / total
        : 0;

    res.json({
      rating: avg.toFixed(1),
      total,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Erreur rating",
    });
  }
});

module.exports = router;