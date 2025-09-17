const mongoose = require("mongoose");

const orderStatusSchema = new mongoose.Schema({
  collect_request_id: { type: String, required: true }, // link to order
  order_amount: Number,
  transaction_amount: Number,
  payment_mode: String,
  payment_details: String,
  bank_reference: String,
  payment_message: String,
  status: { type: String },
  payment_time: { type: Date, default: Date.now },
  error_message: String,
});

module.exports = mongoose.model("OrderStatus", orderStatusSchema);
