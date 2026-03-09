const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  passengerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  seatsBooked: { type: Number, default: 1 },
  status: { type: String, enum: ["pending","confirmed","canceled"], default: "pending" },
  reservationDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Reservation", reservationSchema);