const express = require('express');
const { webhookVerify, messageDlr } = require('../controllers/facebookController');
const router = express.Router();

// webhook
router.get('/webhook-dlr', webhookVerify);
router.post('/webhook-dlr', messageDlr);


module.exports = router;