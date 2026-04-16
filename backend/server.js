require('dotenv').config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const app = express();

app.use(express.json());
app.use(cors());

connectDB();

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/appointments", require("./routes/appointmentRoutes"));

app.listen(5001, () => {
  console.log("Server running on http://localhost:5000");
});