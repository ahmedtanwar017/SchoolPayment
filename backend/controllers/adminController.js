const bcrypt = require("bcrypt");
const userModel = require("../models/user-model.js");
const generateToken = require("../utils/generateToken.js");
const setTokenCookie = require("../utils/cookieUtils.js");

const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Admin not found",
      });
    }

    // Check if admin
    if (!user.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admins only.",
      });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password",
      });
    }

    // Generate token
    const token = generateToken(user);

    // Set cookie
    setTokenCookie(res, token);

    // Send response
    res.status(200).json({
      success: true,
      message: "Login successful",
      user: {
        _id: user._id,
        fullname: user.fullname,
        email: user.email,
        isAdmin: user.isAdmin,
      },
      token,
    });
  } catch (err) {
    // Log the full error to console
    console.error("Admin login error:", err);

    // Send the actual error message for debugging (remove in production)
    res.status(500).json({
      success: false,
      message: err.message || "Server error. Please try again later.",
    });
  }
};

const getAdminDashboard = (req, res) => {
  res.status(200).json({
    user: {
      id: req.admin.id,
      name: req.admin.name,
      email: req.admin.email,
      isAdmin: req.admin.isAdmin,
    },
    message: "Welcome Admin!",
  });
};

module.exports = { loginAdmin, getAdminDashboard };
