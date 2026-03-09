const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  departureCity: { type: String, required: true },
  arrivalCity: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  price: { type: Number, required: true },
  seatsAvailable: { type: Number, required: true },
  description: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Trip", tripSchema);