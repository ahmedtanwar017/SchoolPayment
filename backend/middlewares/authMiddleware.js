const jwt = require("jsonwebtoken");

// middleware/authMiddleware.js
const loggedIn = (req, res, next) => {
  try {
    // First check cookie
    let token = req.cookies?.token;

    // Then check Authorization header
    if (!token && req.headers.authorization?.startsWith("Bearer ")) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "No authentication token provided",
        message: "Please log in to access this resource",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({
      success: false,
      error: "Invalid or expired token",
      message: "Please log in again",
    });
  }
};


// middleware/auth.js
const isAdmin = (req, res, next) => {
  try {
    let token = null;

    if (req.cookies?.token) token = req.cookies.token;
    else if (req.headers.authorization?.startsWith("Bearer "))
      token = req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "No token, authorization denied",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded.isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin only.",
      });
    }

    req.admin = decoded;
    next();
  } catch (err) {
    console.error("Admin middleware error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Unauthorized or invalid token",
    });
  }
};


module.exports = { loggedIn, isAdmin };
