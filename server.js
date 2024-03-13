const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config()
const authRoutes = require('./routes/authRoutes');
const facebookRoutes = require('./routes/facebookRoutes');
const messageRoutes = require('./routes/messageRoutes');
const Message = require('./models/Message');

const app = express();
const PORT = process.env.PORT;

// Middleware
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Attach Socket.IO instance to Express app


// Connect to MongoDB
mongoose.connect(process.env.DB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('MongoDB connected'))
    .catch((err) => console.log(err));

app.use(cors());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/facebook', facebookRoutes);
app.use('/api/messages', messageRoutes);

// SSE endpoint for sending real-time updates to clients
app.get('/api/events', (req, res) => {
    res.set({
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });

    const sendSSE = (data) => {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    };

    const messageStream = Message.watch();
    messageStream.on('change', async (change) => {
        if (change.operationType === 'insert') {
            const newMessage = change.fullDocument;
            sendSSE(newMessage);
        }
    });

    // Handle client disconnect
    req.on('close', () => {
        messageStream.close();
        res.end();
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
