const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    const { name, email, password, role, hospital } = req.body;

    if (!name || !email || !password) {
      return res.json({ success: false, message: "All fields required" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.json({ success: false, message: "User already exists" });
    }

    const newUser = new User({ name, email, password, role, hospital }); // ✅ lowercase
    await newUser.save();

    res.json({ success: true, user: newUser });
  } catch (err) {
    console.error("register error:", err);
    res.json({ success: false, message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });

    if (user) {
      res.json({ success: true, user });
    } else {
      res.json({ success: false, message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("login error:", err);
    res.json({ success: false, message: err.message });
  }
};