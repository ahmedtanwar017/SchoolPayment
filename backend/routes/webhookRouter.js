const express = require("express");
const { handleWebhook } = require("../controllers/webhookController");

const router = express.Router();

// Handle both GET and POST webhooks
router.get("/edviron-pg/callback", handleWebhook);
router.post("/edviron-pg/callback", handleWebhook);


module.exports = router;