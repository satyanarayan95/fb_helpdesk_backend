const express = require('express');
const { webhookVerify, messageDlr } = require('../controllers/facebookController');
const router = express.Router();

// webhook
router.get('/verify-webhook', webhookVerify);
router.post('/webhook-dlr', messageDlr);


module.exports = router;