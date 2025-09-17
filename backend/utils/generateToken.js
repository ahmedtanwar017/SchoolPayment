const jwt = require("jsonwebtoken");

const generateToken = (user) => {
  // Validate user object
  if (!user || !user._id || !user.email) {
    throw new Error("Invalid user data provided for token generation");
  }

  try {
    // Payload for the token (works for both users and admins)
    const payload = {
      id: user._id.toString(),
      email: user.email,
      isAdmin: user.isAdmin || false,  
    };

    // Secret key from environment
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT secret not defined in environment variables");
    }

    // Sign token
    return jwt.sign(payload, secret, {
      expiresIn: "1d",   // Token valid for 1 day
      algorithm: "HS256", // Explicit algorithm
    });

  } catch (error) {
    console.error("JWT generation failed:", error);
    throw new Error("Token generation failed: " + error.message);
  }
};

module.exports = generateToken;
