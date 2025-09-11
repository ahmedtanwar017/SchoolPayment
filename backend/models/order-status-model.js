const mongoose = require("mongoose");

// Order Status Schema
const orderStatusSchema = new mongoose.Schema(
  {
    collect_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Order",
      required: [true, "Order reference is required"],
    },
    order_amount: {
      type: Number,
      required: [true, "Order amount is required"],
    },
    transaction_amount: {
      type: Number,
      required: [true, "Transaction amount is required"],
    },
    payment_mode: {
      type: String,
      required: [true, "Payment mode is required"],
      trim: true,
    },
    payment_details: {
      type: String,
      required: [true, "Payment details are required"],
      trim: true,
    },
    bank_reference: {
      type: String,
      required: [true, "Bank reference is required"],
      trim: true,
    },
    payment_message: {
      type: String,
      required: [true, "Payment message is required"],
      trim: true,
    },
    status: {
      type: String,
      required: [true, "Status is required"],
      trim: true,
    },
    error_message: {
      type: String,
      required: [true, "Error message is required"],
      trim: true,
    },
    payment_time: {
      type: Date,
      required: [true, "Payment time is required"],
    },
  },
  {
    timestamps: true,  // createdAt & updatedAt
    strict: true,      // only defined fields allowed
    minimize: false,   // empty objects are stored
  }
);

const OrderStatus = mongoose.model("OrderStatus", orderStatusSchema);

module.exports = OrderStatus;
