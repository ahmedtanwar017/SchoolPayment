require("dotenv").config();
const axios = require("axios");
const jwt = require("jsonwebtoken");
const Order = require("../models/order-model");

//Create Payment
const createPayment = async (req, res) => {
  try {
    const { amount, student_info } = req.body;

    // Validate student info
    if (
      !student_info ||
      typeof student_info !== "object" ||
      !student_info.name?.trim() ||
      !student_info.id?.trim() ||
      !student_info.email?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Complete student info is required (name, id, email).",
      });
    }

    // Validate amount
    const paymentAmount = Number(amount);
    if (!amount || isNaN(paymentAmount) || paymentAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Valid amount greater than 0 is required.",
      });
    }

    // Create order in DB
    const order = await Order.create({
      school_id: process.env.SCHOOL_ID,
      trustee_id: process.env.TRUSTEE_ID || null,
      student_info: {
        name: student_info.name.trim(),
        id: student_info.id.trim(),
        email: student_info.email.toLowerCase().trim(),
      },
      gateway_name: "edviron",
      order_amount: paymentAmount, // <-- store amount here
      collect_request_id: "", // will be updated after API call
    });

    // Prepare payload and JWT
    const callbackUrl = `${process.env.BASE_URL}/webhooks`;
    const payload = {
      school_id: process.env.SCHOOL_ID,
      amount: paymentAmount.toString(),
      callback_url: callbackUrl,
    };

    const sign = jwt.sign(payload, process.env.PG_KEY, { algorithm: "HS256" });

    // Call Edviron API
    const { data } = await axios.post(
      "https://dev-vanilla.edviron.com/erp/create-collect-request",
      { ...payload, sign },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.API_KEY}`,
        },
        timeout: 15000,
      }
    );

    // Validate response and update order
    if (!data || !data.collect_request_id) {
      return res.status(502).json({
        success: false,
        message: "Invalid response from payment gateway.",
        data,
      });
    }

    order.collect_request_id = data.collect_request_id;
    order.payment_url =
      data.collect_request_url || data.Collect_request_url || null;
    await order.save(); // Persist updates

    // Return clean response without internal order ID
    return res.status(201).json({
      school_id: process.env.SCHOOL_ID,
      amount: paymentAmount,
      collect_request_id: order.collect_request_id,
      payment_url: order.payment_url,
      sign,
    });
  } catch (error) {
    console.error(
      "❌ Payment creation failed:",
      error.response?.data || error.message
    );
    return res.status(500).json({
      success: false,
      message: "Payment creation failed",
      error: error.response?.data || error.message,
    });
  }
};

// Check Payment Status
const checkPaymentStatus = async (req, res) => {
  try {
    const collect_request_id =
      req.params.collect_request_id?.trim() ||
      req.query.collect_request_id?.trim();

    if (!collect_request_id) {
      return res.status(400).json({
        success: false,
        message: "collect_request_id is required",
      });
    }

    // Generate short-lived JWT
    const sign = jwt.sign(
      { school_id: process.env.SCHOOL_ID, collect_request_id },
      process.env.PG_KEY,
      { algorithm: "HS256", expiresIn: "5m" }
    );

    const config = {
      params: { school_id: process.env.SCHOOL_ID, sign },
      headers: { Authorization: `Bearer ${process.env.API_KEY}` },
      timeout: 10000,
    };

    const url = `https://dev-vanilla.edviron.com/erp/collect-request/${collect_request_id}`;
    const { data } = await axios.get(url, config);

    if (!data || typeof data !== "object") {
      return res.status(502).json({
        success: false,
        message: "Invalid response from payment gateway",
        data,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Payment status fetched successfully",
      data,
    });
  } catch (error) {
    console.error(
      "❌ Check Payment Status error:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 500).json({
      success: false,
      message: "Failed to fetch payment status",
      error: error.response?.data || error.message,
    });
  }
};

module.exports = { createPayment, checkPaymentStatus };

