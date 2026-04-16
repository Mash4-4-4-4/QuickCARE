const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema({
  userId: String,
  doctorName: String,
  specialization: String,
  date: String,
  time: String,
  type: String,
  status: { type: String, default: "Scheduled" }
});

module.exports = mongoose.model("Appointment", appointmentSchema);