const axios = require("axios");
const Message = require("../models/Message");

const getMessage = async (req, res) => {
  try {
    const { pageId } = req.query;
    if (!pageId || pageId === "") {
      throw new Error("Please provide a valid page id");
    }

    const allMessages = await Message.find({ pageId }).sort({created_at: 1});
    const messagesGroupedBySenders = allMessages.reduce((acc, item) => {
      if (!acc[item.clientId]) {
        acc[item.clientId] = {
          clientId: item.clientId,
          pageId: item.pageId,
          messages: [],
        };
      }
      acc[item.clientId].messages.push({
        message: item.message,
        senderId: item.senderId,
        time: item.created_at,
      });
      return acc;
    }, {});
    const payload = Object.values(messagesGroupedBySenders);
    return res.json({
      messages: payload,
      message: "Messages received successfully",
    });
  } catch (error) {
    console.error("Error getting messages:", error);
    return res.status(500).json({ message: error.message });
  }
};

const sendMessage = async (req, res) => {
  try {
    const { pageId, clientId, message, accessToken } = req.body;
    const dataToSend = {
      recipient: { id: clientId },
      message: { text: message.trim() },
    };

    await axios.post(`https://graph.facebook.com/v19.0/${pageId}/messages`, dataToSend, {
      params: { access_token: accessToken },
    });

    const newMessage = new Message({ pageId, senderId: pageId, clientId, message, created_at: new Date().getTime() });
    await newMessage.save();
    
    return res.json({ message: "Message sent successfully" });
  } catch (error) {
    const errorCode = error?.response?.data?.error?.code;
    if (errorCode === 190) {
      return res.status(400).json({
        message: "Page access token has expired. Please reconnect to Facebook page",
      });
    }
    return res.status(500).json({ message: "Failed to send message", error });
  }
};

module.exports = { getMessage, sendMessage };
