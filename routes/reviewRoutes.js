const express = require("express");
const router = express.Router();
const reviewController = require("../controllers/reviewController");

// Avis
router.post("/", reviewController.createReview);
router.get("/user/:userId", reviewController.getReviewsByUser);
router.get("/:id", reviewController.getReviewById);
router.delete("/:id", reviewController.deleteReview);

module.exports = router;