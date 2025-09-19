const express = require("express");
const dotenv = require("dotenv");
const path = require("path");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const connectDB = require("./config/mongoose-connection");

// Routers
const usersRouter = require("./routes/usersRouter");
const adminsRouter = require("./routes/adminsRouter");
const paymentRouter = require("./routes/paymentRouter");
const transactionRouter = require("./routes/transactionRouter");
const webhookRouter = require("./routes/webhookRouter");

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// -------------------- MIDDLEWARE -------------------- //

// Parse cookies
app.use(cookieParser());

// Enable CORS
app.use(
  cors({
    origin: "https://schoolpayments.netlify.app",
    credentials: true,
  })
);

// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

// Serve static files if needed (optional)
app.use(express.static(path.join(__dirname, "public")));

// Raw body parser for webhook verification (ONLY for webhooks path)
app.use("/webhooks", express.raw({ type: "application/json" }));

// Regular JSON & URL-encoded parsers for all other routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// -------------------- ROUTES -------------------- //

// Health check
app.get("/", (req, res) => {
  res.status(200).send("✅ SchoolPay Backend is running");
});

// API routes
app.use("/users", usersRouter);
app.use("/admins", adminsRouter);
app.use("/payments", paymentRouter);
app.use("/transactions", transactionRouter);
app.use("/", webhookRouter);

// -------------------- START SERVER -------------------- //

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running at http://localhost:${PORT}`);
});

