const jwt = require("jsonwebtoken");

// middleware/authMiddleware.js
const loggedIn = (req, res, next) => {
  try {
    const token = req.cookies && req.cookies.token;
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No authentication token provided",
        message: "Please log in to access this resource"
      });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "default_secret"
    );

    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);

    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        error: "Session expired",
        message: "Please log in again"
      });
    } else if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        error: "Invalid token",
        message: "Please log in again"
      });
    } else {
      return res.status(500).json({
        success: false,
        error: "Internal server error",
        message: "An unexpected error occurred"
      });
    }
  }
};

// middleware/auth.js
const isAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: "Authentication required",
      message: "User not authenticated",
    });
  }

  if (!req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: "Forbidden",
      message: "Admin access required",
    });
  }

  // User is authenticated and is an admin
  next();
};


module.exports = { loggedIn, isAdmin };
