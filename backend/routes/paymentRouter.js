const express = require("express");
const { createPayment, checkPaymentStatus } = require("../controllers/paymentController");
const { loggedIn } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/create-payment", loggedIn, createPayment);
router.get("/status/:collect_request_id", loggedIn, checkPaymentStatus);

module.exports = router;
