const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const appointmentRoutes = require("./routes/appointmentRoutes");
app.use("/api", appointmentRoutes);

// DB Connection
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB connected"))
.catch(err => console.log(err));

app.get("/", (req, res) => {
  res.send("QuickCARE Backend Running");
});

app.listen(5000, () => console.log("Server running on port 5000"));
