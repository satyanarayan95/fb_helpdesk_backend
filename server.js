const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const socketIo = require('socket.io');
const Message = require('./models/Message');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch((err) => console.log(err));

app.use(cors());

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

const io = socketIo(server);

io.on('connection', (socket) => {
  console.log('A user connected');

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/facebook', require('./routes/facebookRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

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
      io.emit('new message', newMessage);
    }
  });

  req.on('close', () => {
    messageStream.close();
    res.end();
  });
});
