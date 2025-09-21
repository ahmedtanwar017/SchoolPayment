const mongoose = require("mongoose");

const webhookLogSchema = new mongoose.Schema({
  raw_payload: { type: Object, required: true },
  order_id: { type: String },
  status: { type: String, default: "RECEIVED" },
  processed_at: { type: Date },
  sign_method: { type: String },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WebhookLog", webhookLogSchema);
