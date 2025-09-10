const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    school_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "School",
    },
    trustee_id: {
      type: mongoose.Types.ObjectId,
      required: true,
      ref: "Trustee",
    },
    types: {
      type: mongoose.Schema.Types.Mixed, // ObjectId or string
      required: true,
    },
    student_info: {
      name: {
        type: String,
        required: true,
        trim: true,
      },
      id: {
        type: String,
        required: true,
        trim: true,
      },
      email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
      },
    },
    gateway_name: {
      type: String,
      required: true,
      trim: true,
    },
  },
  {
    timestamps: true,        // createdAt & updatedAt automatically
    strict: true,            // only defined fields will be saved
  }
);

const Order = mongoose.model("Order", orderSchema);
module.exports = Order;
