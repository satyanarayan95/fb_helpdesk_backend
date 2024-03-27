const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');
const http = require('http'); // Import the 'http' module
const socketIo = require('socket.io');
const Message = require('./models/Message');
require('dotenv').config();
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 8000;

app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect(process.env.DB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log(err));


// Create a new MongoClient
const client = new MongoClient(process.env.DB_URI, { useNewUrlParser: true, useUnifiedTopology: true });

async function main() {
  try {
    await client.connect();
    const collection = client.db().collection('messages');
    const changeStream = collection.watch();

    // Listen for change events
    changeStream.on('change', (change) => {
      if (change.operationType === 'insert') {
        const newMessage = change.fullDocument;
        io.emit('new message', {
          clientId: newMessage.clientId,
          pageId: newMessage.pageId,
          message: newMessage.message,
          senderId: newMessage.senderId,
          time: newMessage.created_at
        });
      }
    });

    // Keep the program running
    await new Promise(() => { });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    // Close the MongoDB connection
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

main();

app.use(cors());

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "https://helpdesk-facebook-smoky.vercel.app",
    methods: ["GET", "POST"]
  }
});

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


server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = { io };
