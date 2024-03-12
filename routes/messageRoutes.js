const express = require('express');
const { sendMessage, getMessage } = require('../controllers/messageController');
const authenticateToken = require('../middlewares/authMiddleware');
const router = express.Router();

// webhook
router.post('/send-message', authenticateToken, sendMessage);
router.get('/all',authenticateToken, getMessage);


module.exports = router;