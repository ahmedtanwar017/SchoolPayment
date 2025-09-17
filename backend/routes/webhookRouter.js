const express = require("express");
const { handleWebhook } = require("../controllers/webhookController");
const { loggedIn } = require("../middlewares/authMiddleware");

const router = express.Router();

// Handle both GET and POST webhooks
router.get("/", loggedIn, handleWebhook);
router.post("/", loggedIn, handleWebhook);



module.exports = router;