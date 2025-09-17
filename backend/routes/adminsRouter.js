const express = require("express");
const router = express.Router();
const { loginAdmin, getAdminDashboard } = require("../controllers/adminController");
const { isAdmin } = require("../middlewares/authMiddleware");

// Admin login
router.post("/auth/login", loginAdmin);

// Admin dashboard (protected)
router.get("/admin/dashboard", isAdmin, getAdminDashboard);

module.exports = router;
