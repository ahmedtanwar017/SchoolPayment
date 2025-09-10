const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/mongoose-connection");

// Load environment variables from .env
dotenv.config();

const app = express();

// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Default route
app.get("/", (req, res) => {
  res.send("🚀 SchoolPay Backend Working");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);

  // Log the environment mode
  switch (process.env.NODE_ENV) {
    case "development":
      console.log("🚀 Running in Development mode");
      break;
    case "production":
      console.log("✅ Running in Production mode");
      break;
    default:
      console.log("ℹ️ Running in Unknown/Other mode:", process.env.NODE_ENV);
  }
});


