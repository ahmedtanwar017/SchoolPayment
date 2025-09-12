const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/mongoose-connection");
const usersRouter = require("./routes/usersRouter");
const cookieParser = require("cookie-parser");
const cors = require("cors");

// Load environment variables from .env
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173", // React frontend
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Default route
app.get("/", (req, res) => {
  res.send("🚀 SchoolPay Backend Working");
});

// API routes
app.use("/users", usersRouter);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
  
  const mode = process.env.NODE_ENV || "unknown";
  console.log(`ℹ️ Running in ${mode} mode`);
});
