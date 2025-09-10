const mongoose = require("mongoose");
const config = require("config");
const debug = require("debug")("app:db"); 

const connectDB = async () => {
  try {
    // Mongo URI from config (which ideally reads from development.json)
    const mongoURI = `${config.get("MONGODB_URI")}/schoolpay`;

    if (!mongoURI) {
      throw new Error("Mongo URI not defined in config/environment");
    }

    await mongoose.connect(mongoURI);

    debug("✅ MongoDB connected successfully");
  } catch (err) {
    debug("❌ MongoDB connection error: %O", err);

    // Production-friendly retry instead of exit
    setTimeout(connectDB, 5000); 
  }
};

module.exports = connectDB;
