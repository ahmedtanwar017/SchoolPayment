const mongoose = require("mongoose");

const webhookLogSchema = new mongoose.Schema({
  raw_payload: Object,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("WebhookLog", webhookLogSchema);
