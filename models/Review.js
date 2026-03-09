const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  reviewerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reviewedUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip" },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Review", reviewSchema);