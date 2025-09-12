const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/mongoose-connection");
const usersRouter = require("./routes/usersRouter");
const adminsRouter = require("./routes/adminsRouter")
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
    origin: process.env.CLIENT_URL || "http://localhost:5173", // React frontend
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// Health check route
app.get("/", (req, res) => {
  res.status(200).send("SchoolPay Backend is running");
});

// API routes
app.use("/users", usersRouter);
app.use("/admins", adminsRouter);

// Start server
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
