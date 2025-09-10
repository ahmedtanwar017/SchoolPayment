const mongoose = require("mongoose");
const config = require("config");
const debug = require("debug")("development:mongoose");

const connectDB = async () => {
  const mongoURI = `${config.get("MONGODB_URI")}/schoolpay`; // database name appended

  try {
    await mongoose.connect(mongoURI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    debug("✅ MongoDB connected");
  } catch (err) {
    debug("❌ MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectDB;
