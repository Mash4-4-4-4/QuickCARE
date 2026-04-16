const Appointment = require("../models/Appointment");

exports.createAppointment = async (req, res) => {
  try {
    const appt = new Appointment(req.body);
    await appt.save();
    res.json({ success: true });
  } catch (err) {
    console.error("createAppointment error:", err);
    res.json({ success: false, message: err.message });
  }
};

exports.getAppointments = async (req, res) => {
  const { userId } = req.query;
  const appts = await Appointment.find({ userId });
  res.json(appts);
};
