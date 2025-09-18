const bcrypt = require("bcrypt");
const userModel = require("../models/user-model.js");
const generateToken = require("../utils/generateToken.js");
const setTokenCookie = require("../utils/cookieUtils.js");

// Admin Login
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email?.trim() || !password?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // Find user by email
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

    // Generate JWT (make sure generateToken includes isAdmin)
    const token = generateToken(user);

    // Set cookie (optional, frontend can also use token directly)
    setTokenCookie(res, token);

    // Success response
    return res.status(200).json({
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
    console.error("Admin login error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error. Please try again later.",
    });
  }
};

// Admin Dashboard
const getAdminDashboard = (req, res) => {
  try {
    // req.admin comes from isAdmin middleware (decoded JWT)
    res.status(200).json({
      success: true,
      message: "Welcome Admin!",
      user: {
        id: req.admin?.id,
        name: req.admin?.fullname || req.admin?.name,
        email: req.admin?.email,
        isAdmin: req.admin?.isAdmin,
      },
    });
  } catch (err) {
    console.error("Dashboard error:", err);
    res.status(500).json({
      success: false,
      message: "Could not load dashboard",
    });
  }
};

module.exports = { loginAdmin, getAdminDashboard };
