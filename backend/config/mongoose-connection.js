const mongoose = require("mongoose");
const config = require("config");
const debug = require("debug")("app:db");

/**
 * Connect to MongoDB
 */
const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI 

    if (!mongoURI) {
      throw new Error("MongoDB URI not found in config/environment");
    }

    await mongoose.connect(mongoURI, {
      maxPoolSize: 10,               // Optimize connection pooling
      serverSelectionTimeoutMS: 5000 // Fail fast if DB is unreachable
    });

    debug("MongoDB connection established.");
  } catch (err) {
    debug("MongoDB connection error:", err.message);

    if (process.env.NODE_ENV === "production") {
      debug("Retrying connection in 5 seconds...");
      setTimeout(connectDB, 5000);
    } else {
      process.exit(1); // Fail fast in development
    }
  }
};

/**
 * Graceful shutdown handlers
 */
["SIGINT", "SIGTERM"].forEach((signal) => {
  process.on(signal, async () => {
    await mongoose.connection.close();
    debug(`MongoDB connection closed due to app termination (${signal}).`);
    process.exit(0);
  });
});

module.exports = connectDB;
