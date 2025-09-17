const mongoose = require("mongoose");
const validator = require("validator");

const userSchema = new mongoose.Schema({
  fullname: {
    type: String,
    required: [true, "Full name is required"],
    trim: true,
    minlength: [2, "Name must be at least 2 characters"],
    maxlength: [50, "Name must be at most 50 characters"],
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    trim: true,
    lowercase: true,
    validate: {
      validator: validator.isEmail,
      message: "Invalid email address",
    },
  },
  password: {
    type: String,
    required: [true, "Password is required"],
    minlength: [8, "Password must be at least 8 characters"],
    select: false, // Don't return password by default
  },
  isAdmin: {
    type: Boolean,
    required: true, // Must always be present
    default: false, // New users are regular users by default
    index: true, // Indexed for faster queries
    enum: [true, false], // Strictly allows only true or false
  },
});

module.exports = mongoose.model("User", userSchema);
