// const axios = require("axios");
// const jwt = require("jsonwebtoken");
// const crypto = require("crypto");
// const OrderStatus = require("../models/order-status-model");
// const WebhookLog = require("../models/webhook-log-model");

// const normalizeStatus = (s) => {
//   const map = {
//     SUCCESS: "success",
//     FAILED: "failed",
//     CANCELLED: "cancelled",
//     PENDING: "pending",
//   };
//   return map[(s || "").toUpperCase()] || "unknown";
// };

// const buildOrder = (orderInfo, fallback = false) => ({
//   order_id: orderInfo.order_id || "unknown",
//   order_amount: orderInfo.order_amount ?? 0,
//   transaction_amount: orderInfo.transaction_amount ?? 0,
//   gateway: orderInfo.gateway || "Unknown",
//   bank_reference: orderInfo.bank_reference || "NA",
//   status: normalizeStatus(orderInfo.status),
//   payment_mode: orderInfo.payment_mode || "NA",
//   payment_details: orderInfo.payment_details || "NA",
//   payment_message: orderInfo.payment_message || orderInfo.reason || "NA",
//   payment_time: orderInfo.payment_time ? new Date(orderInfo.payment_time) : new Date(),
//   error_message: orderInfo.error_message || (fallback ? "Fallback/default data used" : "NA"),
//   is_fallback: fallback,
// });

// const handleWebhook = async (req, res) => {
//   try {
//     let orderInfo = {};

//     // Extract order info from GET or POST
//     if (req.method === "POST") {
//       orderInfo = req.body.order_info || {};
//     } else if (req.method === "GET") {
//       orderInfo = {
//         order_id: req.query.EdvironCollectRequestId,
//         status: req.query.status,
//         reason: req.query.reason || "",
//       };
//     }

//     if (!orderInfo.order_id) {
//       return res.status(400).json({
//         status: 400,
//         message: "Missing order_id or EdvironCollectRequestId",
//       });
//     }

//     const collect_request_id = orderInfo.order_id.includes("/")
//       ? orderInfo.order_id.split("/")[0]
//       : orderInfo.order_id;

//     // Log raw webhook
//     const logEntry = await WebhookLog.create({
//       raw_payload: req.method === "POST" ? req.body : req.query,
//       order_id: orderInfo.order_id,
//       status: "RECEIVED",
//     });

//     let unifiedOrder;
//     let edvironRaw = {};
//     let signMethod = "unknown";
//     let fallback = false;

//     try {
//       const schoolId = process.env.SCHOOL_ID;
//       const secret = process.env.PG_KEY;

//       if (!schoolId || !secret) {
//         throw new Error("Missing SCHOOL_ID or PG_KEY in .env");
//       }

//       // Generate JWT sign, fallback to SHA256 if JWT fails
//       let sign;
//       try {
//         sign = jwt.sign({ school_id: schoolId, collect_request_id }, secret, { algorithm: "HS256" });
//         signMethod = "JWT";
//       } catch {
//         sign = crypto.createHash("sha256").update(`${collect_request_id}${schoolId}${secret}`).digest("hex");
//         signMethod = "SHA256";
//       }

//       const url = `https://dev-vanilla.edviron.com/erp/collect-request/${collect_request_id}?school_id=${schoolId}&sign=${sign}`;
//       console.log(`🌐 Calling Edviron API with ${signMethod} for order: ${collect_request_id}`);

//       const { data } = await axios.get(url, { timeout: 10000 });
//       edvironRaw = data;
//       unifiedOrder = buildOrder(data.order_info || data, false);
//     } catch (apiErr) {
//       console.warn("⚠️ Edviron API failed, using fallback:", apiErr.message);
//       fallback = true;
//       unifiedOrder = buildOrder(orderInfo, true);
//     }

//     // Save or update order in DB
//     await OrderStatus.findOneAndUpdate(
//       { collect_request_id },
//       { ...unifiedOrder, signMethod },
//       { upsert: true, new: true }
//     );

//     logEntry.status = "PROCESSED";
//     logEntry.processed_at = new Date();
//     logEntry.sign_method = signMethod;
//     await logEntry.save();

//     return res.status(200).json({
//       status: 200,
//       signMethod,
//       webhook_version: "1.0",
//       collect_request_id,
//       order_info: unifiedOrder,
//       edviron_response: edvironRaw,
//     });
//   } catch (err) {
//     console.error("❌ Webhook error:", err.message);
//     return res.status(500).json({
//       status: 500,
//       message: "Webhook processing failed",
//       error: err.message,
//     });
//   }
// };

// module.exports = { handleWebhook };

const axios = require("axios");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const OrderStatus = require("../models/order-status-model");
const WebhookLog = require("../models/webhook-log-model");

// Normalize status
const normalizeStatus = (s) => {
  const map = { SUCCESS: "success", FAILED: "failed", CANCELLED: "cancelled", PENDING: "pending" };
  return map[(s || "").toUpperCase()] || "unknown";
};

// Build unified order object
const buildOrder = (orderInfo, fallback = false) => ({
  order_id: orderInfo.order_id || "unknown",
  order_amount: orderInfo.order_amount ?? 0,
  transaction_amount: orderInfo.transaction_amount ?? 0,
  gateway: orderInfo.gateway || "Unknown",
  bank_reference: orderInfo.bank_reference || "NA",
  status: normalizeStatus(orderInfo.status),
  payment_mode: orderInfo.payment_mode || "NA",
  payment_details: orderInfo.payment_details || "NA",
  payment_message: orderInfo.payment_message || orderInfo.reason || "NA",
  payment_time: orderInfo.payment_time ? new Date(orderInfo.payment_time) : new Date(),
  error_message: orderInfo.error_message || (fallback ? "Fallback/default data used" : "NA"),
  is_fallback: fallback,
});

const handleWebhook = async (req, res) => {
  const debugLog = [];

  try {
    debugLog.push(`Incoming webhook: ${req.method}`);
    debugLog.push(`Query: ${JSON.stringify(req.query)}`);
    debugLog.push(`Body: ${JSON.stringify(req.body || {})}`);

    let orderInfo = {};
    if (req.method === "POST") orderInfo = req.body.order_info || {};
    else if (req.method === "GET") orderInfo = {
      order_id: req.query.EdvironCollectRequestId || req.query.collect_request_id,
      status: req.query.status,
      reason: req.query.reason || "",
    };

    debugLog.push(`Resolved orderInfo: ${JSON.stringify(orderInfo)}`);

    if (!orderInfo.order_id) return res.status(400).json({ status: 400, message: "Missing order_id", debugLog });

    const collect_request_id = orderInfo.order_id.includes("/") ? orderInfo.order_id.split("/")[0] : orderInfo.order_id;
    debugLog.push(`collect_request_id: ${collect_request_id}`);

    // Log webhook (optional)
    let logEntry;
    try {
      logEntry = await WebhookLog.create({
        raw_payload: req.method === "POST" ? req.body : req.query,
        order_id: orderInfo.order_id,
        status: "RECEIVED",
      });
      debugLog.push("Webhook log saved");
    } catch (err) { debugLog.push(`Failed to save webhook log: ${err.message}`); }

    // API call / env
    let unifiedOrder, edvironRaw = {}, signMethod = "unknown", fallback = false;
    const schoolId = process.env.SCHOOL_ID;
    const secret = process.env.PG_KEY;

    if (!schoolId || !secret) {
      debugLog.push("Missing SCHOOL_ID or PG_KEY, using fallback");
      fallback = true;
      unifiedOrder = buildOrder(orderInfo, true);
    } else {
      try {
        let sign;
        try { sign = jwt.sign({ school_id: schoolId, collect_request_id }, secret, { algorithm: "HS256" }); signMethod = "JWT"; }
        catch { sign = crypto.createHash("sha256").update(`${collect_request_id}${schoolId}${secret}`).digest("hex"); signMethod = "SHA256"; }

        const url = `https://dev-vanilla.edviron.com/erp/collect-request/${collect_request_id}?school_id=${schoolId}&sign=${sign}`;
        debugLog.push(`Calling Edviron API with ${signMethod}: ${url}`);

        const { data } = await axios.get(url, { timeout: 10000 });
        edvironRaw = data;
        unifiedOrder = buildOrder(data.order_info || data, false);
        debugLog.push("Edviron API call successful");
      } catch (apiErr) {
        debugLog.push(`Edviron API failed, using fallback: ${apiErr.message}`);
        fallback = true;
        unifiedOrder = buildOrder(orderInfo, true);
      }
    }

    // Save/update order in DB
    try {
      await OrderStatus.findOneAndUpdate(
        { collect_request_id },
        { ...unifiedOrder, signMethod },
        { upsert: true, new: true }
      );
      debugLog.push("Order saved/updated in DB");
    } catch (dbErr) { debugLog.push(`Failed to save order in DB: ${dbErr.message}`); }

    // Update webhook log
    if (logEntry) {
      logEntry.status = "PROCESSED";
      logEntry.processed_at = new Date();
      logEntry.sign_method = signMethod;
      try { await logEntry.save(); debugLog.push("Webhook log updated"); }
      catch (err) { debugLog.push(`Failed to update webhook log: ${err.message}`); }
    }

    // Always return 200 with debug
    return res.status(200).json({
      status: 200,
      signMethod,
      webhook_version: "1.0",
      collect_request_id,
      order_info: unifiedOrder,
      edviron_response: edvironRaw,
      debugLog,
    });

  } catch (err) {
    debugLog.push(`Unexpected error: ${err.message}`);
    return res.status(200).json({ status: 200, message: "Webhook received with error", debugLog, error: err.message });
  }
};

module.exports = { handleWebhook };
