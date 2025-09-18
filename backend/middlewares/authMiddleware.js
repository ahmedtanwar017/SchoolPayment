const jwt = require("jsonwebtoken");

// middleware/authMiddleware.js
const loggedIn = (req, res, next) => {
  try {
    // 1️⃣ Get token from Authorization header OR cookies
    let token = req.headers.authorization?.split(" ")[1]; // Bearer <token>
    if (!token && req.cookies) {
      token = req.cookies.token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No authentication token provided",
        message: "Please log in to access this resource"
      });
    }

    // 2️⃣ Verify JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
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
  try {
    let token = null;

    // Check cookie
    if (req.cookies?.token) {
      token = req.cookies.token;
    }

    // Check Authorization header
    else if (req.headers.authorization) {
      const authHeader = req.headers.authorization;
      if (authHeader.startsWith("Bearer ")) {
        token = authHeader.split(" ")[1];
      } else {
        token = authHeader; // raw token
      }
    }

    if (!token) {
      return res.status(401).json({ success: false, message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({ success: false, message: "Access denied. Admin only." });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

module.exports = { loggedIn, isAdmin };
