const Order = require("../models/order-model");
const OrderStatus = require("../models/order-status-model");

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Order.aggregate([
      {
        $lookup: {
          from: "orderstatuses",                // MongoDB collection name
          localField: "collect_request_id",     // field in Order
          foreignField: "collect_request_id",   // field in OrderStatus
          as: "status_info",
        },
      },
      { $unwind: { path: "$status_info", preserveNullAndEmptyArrays: true } }, // keep orders even if no status
      {
        $project: {
          collect_request_id: "$collect_request_id",
          school_id: 1,
          trustee_id: 1,
          student_info: 1,
          gateway_name: 1,
          order_amount: { $ifNull: ["$order_amount", 0] },
          transaction_amount: { $ifNull: ["$status_info.transaction_amount", 0] },
          gateway: { $ifNull: ["$status_info.gateway", "$gateway_name"] },
          payment_mode: { $ifNull: ["$status_info.payment_mode", ""] },
          payment_details: { $ifNull: ["$status_info.payment_details", ""] },
          bank_reference: { $ifNull: ["$status_info.bank_reference", ""] },
          status: { $toUpper: { $ifNull: ["$status_info.status", "PENDING"] } },
          payment_message: { $ifNull: ["$status_info.payment_message", ""] },
          payment_time: { $ifNull: ["$status_info.payment_time", "$createdAt"] },
          error_message: { $ifNull: ["$status_info.error_message", ""] },
        },
      },
      { $sort: { payment_time: -1 } }, // newest first
    ]);

    res.status(200).json({ success: true, data: transactions });
  } catch (err) {
    console.error("Error fetching transactions:", err);
    res.status(500).json({ success: false, message: "Server Error", error: err.message });
  }
};

module.exports = { getAllTransactions };
