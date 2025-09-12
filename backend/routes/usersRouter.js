const express = require("express");
const router = express.Router();
const { registerUser, loginUser, logoutUser, getMe } = require("../controllers/authController");
const { loggedIn } = require("../middlewares/authMiddleware")

// @route   POST /users/register
// @desc    Register a new user
router.post("/register", registerUser);

// @route   POST /users/login
// @desc    Login user
router.post("/login", loginUser);

// @route   GET /users/logout
// @desc    Logot user
router.get("/logout", logoutUser);


router.get("/me", loggedIn, getMe);

module.exports = router;

