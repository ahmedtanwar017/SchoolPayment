const bcrypt = require("bcrypt");
const userModel = require("../models/user-model.js");
const generateToken = require("../utils/generateToken.js");
const setTokenCookie = require("../utils/cookieUtils.js")

// Password validation regex
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/;

// REGISTER USER
const registerUser = async (req, res) => {
  try {
    const { fullname, email, password } = req.body;

    // Validate input
    if (!fullname?.trim() || !email?.trim() || !password?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    // Validate password complexity
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be minimum 8 characters, include uppercase, lowercase, number, and special character",
      });
    }

    // Check if user exists
    const existingUser = await userModel.findOne({ email }).lean();
    if (existingUser) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with hashed password
    const newUser = await userModel.create({
      fullname,
      email,
      password: hashedPassword,
    });

    // Generate token and set cookie
    const token = generateToken(newUser);
    setTokenCookie(res, token);

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: newUser._id,
        fullname: newUser.fullname,
        email: newUser.email,
      },
      token,
    });
  } catch (err) {
    console.error("Registration error:", err);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((val) => val.message);
      return res
        .status(400)
        .json({ success: false, message: messages.join(", ") });
    }

    res.status(500).json({ success: false, message: "Server error" });
  }
};

// LOGIN USER
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email?.trim() || !password?.trim()) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    // Find user and include password
    const user = await userModel.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Compare plain password with hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Generate token and set cookie
    const token = generateToken(user);
    setTokenCookie(res, token);

    res.status(200).json({
      success: true,
      message: "Login successful",
      user: { id: user._id, fullname: user.fullname, email: user.email },
      token,
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

const logoutUser = (req, res) => {
  try {
    // 🔑 Reuse the same cookie setter, but pass an empty token & immediate expiry
    setTokenCookie(res, "");
    res.cookie("token", "", { expires: new Date(0) }); // make sure it clears

    return res
      .status(200)
      .json({ success: true, message: "Logout successful" });
  } catch (err) {
    console.error("Logout error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error during logout" });
  }
};

const getMe = (req, res) => {
  // Validate that user authentication was successful
  if (!req.user?.id) {
    return res.status(401).json({
      error: "Authentication required",
      message: "User not authenticated",
    });
  }

  // Return only essential, non-sensitive user information
  res.status(200).json({
    user: {
      id: req.user.id,
      name: req.user.name,
      // Optional: include other safe fields if they exist
      ...(req.user.email && { email: req.user.email }),
      ...(req.user.username && { username: req.user.username }),
    },
  });
};

module.exports = { registerUser, loginUser, logoutUser, getMe };
