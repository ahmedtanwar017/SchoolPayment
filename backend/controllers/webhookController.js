// const OrderStatus = require("../models/order-status-model");
// const WebhookLog = require("../models/webhook-log-model");

// const handleWebhook = async (req, res) => {
//   try {
//     console.log("✅ Webhook received:", { 
//       method: req.method, 
//       body: req.body, 
//       query: req.query 
//     });

//     // STEP 1: Extract data based on request method
//     let orderInfo = {};
    
//     if (req.method === "POST") {
//       // Handle POST requests with order_info in body
//       orderInfo = req.body.order_info || {};
//     } else if (req.method === "GET") {
//       // Handle GET requests with query parameters
//       orderInfo = {
//         order_id: req.query.EdvironCollectRequestId,
//         status: req.query.status,
//         // Map other possible query parameters if needed
//         // order_amount: req.query.order_amount,
//         // transaction_amount: req.query.transaction_amount,
//         // etc.
//       };
//     }

//     // STEP 2: Validate required fields
//     if (!orderInfo.order_id) {
//       return res.status(400).json({ 
//         message: "Missing order_id or EdvironCollectRequestId" 
//       });
//     }

//     const {
//       order_id,
//       order_amount,
//       transaction_amount,
//       gateway,
//       bank_reference,
//       status,
//       payment_mode,
//       payemnt_details, // keep spelling as in payload
//       Payment_message,
//       payment_time,
//       error_message,
//     } = orderInfo;

//     // Extract collect_request_id
//     const collect_request_id = order_id.includes("/")
//       ? order_id.split("/")[0]
//       : order_id;

//     // Save raw webhook log
//     const logEntry = await WebhookLog.create({
//       raw_payload: req.method === "POST" ? req.body : req.query,
//       order_id,
//       status: "RECEIVED",
//     });

//     // Prepare data for DB
//     const orderData = {
//       collect_request_id,
//       order_amount: order_amount || 0,
//       transaction_amount: transaction_amount || 0,
//       gateway: gateway || "",
//       payment_mode: payment_mode || "",
//       payment_details: payemnt_details || "",
//       bank_reference: bank_reference || "",
//       status: (status || "").toUpperCase(),
//       payment_message: Payment_message || "",
//       payment_time: payment_time ? new Date(payment_time) : new Date(),
//       error_message: error_message || "",
//     };

//     // Upsert into OrderStatus
//     await OrderStatus.findOneAndUpdate(
//       { collect_request_id },
//       orderData,
//       { upsert: true, new: true }
//     );

//     // Update log
//     logEntry.status = "PROCESSED";
//     logEntry.processed_at = new Date();
//     await logEntry.save();

//     console.log(`✅ Webhook processed for order ${collect_request_id}, status: ${orderData.status}`);

//     return res.status(200).json({
//       message: "Webhook processed successfully",
//       data: orderData,
//     });
//   } catch (err) {
//     console.error("❌ Webhook error:", err);
//     return res.status(500).json({
//       error: "Webhook processing failed",
//       details: err.message,
//     });
//   }
// };

// module.exports = { handleWebhook };

// const OrderStatus = require("../models/order-status-model");
// const WebhookLog = require("../models/webhook-log-model");
// const axios = require("axios"); // Make sure axios is installed

// const handleWebhook = async (req, res) => {
//   try {
//     // STEP 0: Ensure body is parsed
//     let parsedBody = {};
//     if (req.body) {
//       if (Buffer.isBuffer(req.body)) {
//         // Parse Buffer if body is raw
//         parsedBody = JSON.parse(req.body.toString());
//       } else {
//         parsedBody = req.body;
//       }
//     }

//     console.log("✅ Webhook received:", { 
//       method: req.method, 
//       body: parsedBody, 
//       query: req.query 
//     });

//     // STEP 1: Extract data
//     let orderInfo = {};
//     if (req.method === "POST") {
//       orderInfo = parsedBody.order_info || {};
//     } else if (req.method === "GET") {
//       orderInfo = {
//         order_id: req.query.EdvironCollectRequestId,
//         status: req.query.status,
//       };
//     }

//     // STEP 2: Validate order_id
//     if (!orderInfo.order_id) {
//       return res.status(400).json({ 
//         message: "Missing order_id or EdvironCollectRequestId" 
//       });
//     }

//     const collect_request_id = orderInfo.order_id.includes("/")
//       ? orderInfo.order_id.split("/")[0]
//       : orderInfo.order_id;

//     // STEP 3: Fetch full data from Check Status API
//     const school_id = parsedBody.school_id || req.query.school_id || "";
//     const sign = parsedBody.sign || req.query.sign || "";

//     let fullData = {};
//     if (school_id && sign) {
//       try {
//         const response = await axios.get(
//           `https://dev-vanilla.edviron.com/erp/collect-request/${collect_request_id}?school_id=${school_id}&sign=${sign}`
//         );
//         fullData = response.data || {};
//       } catch (err) {
//         console.warn("⚠️ Could not fetch full order data:", err.message);
//       }
//     }

//     // Merge webhook data with full API data
//     const data = { ...orderInfo, ...fullData };

//     const {
//       order_amount,
//       transaction_amount,
//       gateway,
//       bank_reference,
//       status,
//       payment_mode,
//       payemnt_details, // keep spelling as in payload
//       Payment_message,
//       payment_time,
//       error_message,
//     } = data;

//     // STEP 4: Save raw webhook log
//     const logEntry = await WebhookLog.create({
//       raw_payload: parsedBody,
//       order_id: orderInfo.order_id,
//       status: "RECEIVED",
//     });

//     // STEP 5: Prepare data for DB
//     const orderData = {
//       collect_request_id,
//       order_amount: order_amount || 0,
//       transaction_amount: transaction_amount || 0,
//       gateway: gateway || "",
//       payment_mode: payment_mode || "",
//       payment_details: payemnt_details || "",
//       bank_reference: bank_reference || "",
//       status: (status || "").toUpperCase(),
//       payment_message: Payment_message || "",
//       payment_time: payment_time ? new Date(payment_time) : new Date(),
//       error_message: error_message || "",
//     };

//     // Upsert into OrderStatus
//     await OrderStatus.findOneAndUpdate(
//       { collect_request_id },
//       orderData,
//       { upsert: true, new: true }
//     );

//     // Update log
//     logEntry.status = "PROCESSED";
//     logEntry.processed_at = new Date();
//     await logEntry.save();

//     console.log(`✅ Webhook processed for order ${collect_request_id}, status: ${orderData.status}`);

//     return res.status(200).json({
//       message: "Webhook processed successfully",
//       data: orderData,
//     });
//   } catch (err) {
//     console.error("❌ Webhook error:", err);
//     return res.status(500).json({
//       error: "Webhook processing failed",
//       details: err.message,
//     });
//   }
// };

// module.exports = { handleWebhook };

const OrderStatus = require("../models/order-status-model");
const WebhookLog = require("../models/webhook-log-model");
const axios = require("axios");
const jwt = require("jsonwebtoken");

const handleWebhook = async (req, res) => {
  try {
    // STEP 0: Parse body safely (handles Buffer or JSON)
    let parsedBody = {};
    if (req.body) {
      parsedBody = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString()) : req.body;
    }

    console.log("✅ Webhook received:", { method: req.method, body: parsedBody, query: req.query });

    // STEP 1: Extract order info
    const orderInfo = req.method === "POST"
      ? parsedBody.order_info || {}
      : { order_id: req.query.EdvironCollectRequestId, status: req.query.status };

    if (!orderInfo.order_id) {
      return res.status(400).json({ message: "Missing order_id or EdvironCollectRequestId" });
    }

    const collect_request_id = orderInfo.order_id.includes("/") ? orderInfo.order_id.split("/")[0] : orderInfo.order_id;

    // STEP 2: Generate short-lived JWT
    const sign = jwt.sign(
      { school_id: process.env.SCHOOL_ID, collect_request_id },
      process.env.PG_KEY,
      { algorithm: "HS256", expiresIn: "5m" }
    );

    // STEP 3: Fetch full data from Edviron API
    const url = `${process.env.PAYMENT_API_URL}/collect-request/${collect_request_id}`;
    const config = {
      params: { school_id: process.env.SCHOOL_ID, sign },
      headers: { Authorization: `Bearer ${process.env.API_KEY}` },
      timeout: 10000,
    };

    console.log("Fetching full data from Edviron API:", { url, params: config.params, headers: config.headers });

    let fullData = {};
    try {
      const { data } = await axios.get(url, config);
      fullData = data || {};
      console.log("✅ Full data fetched:", fullData);
    } catch (err) {
      console.warn("⚠️ Could not fetch full order data:", err.response?.data || err.message);
    }

    // STEP 4: Merge webhook payload and full API data
    const mergedData = { ...orderInfo, ...fullData };
    const {
      order_amount,
      transaction_amount,
      gateway,
      status,
      payemnt_details,
      Payment_message,
      payment_time,
      error_message,
      details = {},
    } = mergedData;

    // Extract proper payment_mode and bank_reference from details
    const payment_mode = details.payment_mode || "";
    const bank_reference = details.bank_ref || "";

    // STEP 5: Save raw webhook log
    const logEntry = await WebhookLog.create({
      raw_payload: parsedBody,
      order_id: orderInfo.order_id,
      status: "RECEIVED",
    });

    // STEP 6: Prepare data for MongoDB
    const orderData = {
      collect_request_id,
      order_amount: order_amount || 0,
      transaction_amount: transaction_amount || 0,
      gateway: gateway || "",
      payment_mode,
      payment_details: payemnt_details || "",
      bank_reference,
      status: (status || "").toUpperCase(),
      payment_message: Payment_message || "",
      payment_time: payment_time ? new Date(payment_time) : new Date(),
      error_message: error_message || "",
    };

    // STEP 7: Upsert into OrderStatus
    await OrderStatus.findOneAndUpdate({ collect_request_id }, orderData, { upsert: true, new: true });

    // STEP 8: Update webhook log
    logEntry.status = "PROCESSED";
    logEntry.processed_at = new Date();
    await logEntry.save();

    console.log(`✅ Webhook processed for order ${collect_request_id}, status: ${orderData.status}`);

    return res.status(200).json({ message: "Webhook processed successfully", data: orderData });

  } catch (err) {
    console.error("❌ Webhook error:", err);
    return res.status(500).json({ error: "Webhook processing failed", details: err.message });
  }
};

module.exports = { handleWebhook };
