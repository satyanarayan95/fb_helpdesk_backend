const mongoose = require("mongoose");
const { Schema } = mongoose;

const MessageSchema = new Schema({
  clientId: {
    type: String,
    require: true,
  },
  pageId: {
    type: String,
    require: true,
  },
  message: {
    type: String,
    require: true,
  },
  senderId: {
    type: String,
    require: true,
  },
  created_at: {
    type: Number,
    default: new Date().getTime(),
  },
});

module.exports = mongoose.model("messages", MessageSchema);
