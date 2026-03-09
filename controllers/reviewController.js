const Review = require("../models/Review");

// Créer un avis
exports.createReview = async (req, res) => {
  try {
    const review = new Review(req.body);
    await review.save();
    res.status(201).json(review);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Récupérer les avis d’un utilisateur
exports.getReviewsByUser = async (req, res) => {
  try {
    const reviews = await Review.find({ reviewedUserId: req.params.userId })
      .populate("reviewerId", "name");
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Supprimer un avis
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findByIdAndDelete(req.params.id);
    if(!review) return res.status(404).json({ error: "Avis non trouvé" });
    res.json({ message: "Avis supprimé" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
exports.getReviewById = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate("reviewerId", "name")
      .populate("reviewedUserId", "name");
    if(!review) return res.status(404).json({ error: "Avis non trouvé" });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};