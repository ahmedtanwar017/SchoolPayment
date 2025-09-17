const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    school_id: { type: mongoose.Schema.Types.Mixed, required: true },
    trustee_id: { type: mongoose.Schema.Types.Mixed, default: null },
    student_info: {
      name: { type: String, required: true, trim: true },
      id: { type: String, trim: true },
      email: { type: String, trim: true, lowercase: true },
    },
    gateway_name: { type: String, required: true, trim: true },
    order_amount: { type: Number, default: 0 },
    collect_request_id: { type: String, default: "" },  // store customer ID here  
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Order", orderSchema);
