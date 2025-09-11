const mongoose = require("mongoose");

// Webhook Logs Schema
const webhookLogsSchema = new mongoose.Schema(
  {
    event_name: {
      type: String,
      required: [true, "Event name is required"],
      trim: true,
    },
    payload: {
      type: Object, // raw webhook data
      required: [true, "Payload is required"],
    },
    status: {
      type: String, // success / failed
      required: [true, "Status is required"],
      trim: true,
      enum: ["success", "failed"], // allowed values
    },
    error_message: {
      type: String,
      trim: true,
      default: "", // ensure always a string
    },
    received_at: {
      type: Date,
      default: Date.now, // auto-store webhook received time
    },
  },
  {
    timestamps: true, // createdAt & updatedAt
    strict: true,
    minimize: false,
  }
);

// Helper method to mark log as failed
webhookLogsSchema.methods.markFailed = function (errorMsg) {
  this.status = "failed";
  this.error_message = errorMsg;
  return this.save();
};

// Helper method to mark log as success
webhookLogsSchema.methods.markSuccess = function () {
  this.status = "success";
  this.error_message = "";
  return this.save();
};

const WebhookLog = mongoose.model("WebhookLog", webhookLogsSchema);

module.exports = WebhookLog;
