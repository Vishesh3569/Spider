const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat"); // Path to your Chat model
// const { authenticateUser } = require("../middleware/auth"); // Optional middleware for authentication

// Route to fetch messages between two users
router.get("/messages/:userId1/:userId2", async (req, res) => {
  const { userId1, userId2 } = req.params;

  try {
    // Fetch only 1-on-1 chats between the two users
    const messages = await Chat.find({
      participants: { $all: [userId1, userId2], $size: 2 }, // Exactly two participants
    }).sort({ timestamp: 1 });

    // Send the messages back to the client
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ message: "Error fetching messages", error });
  }
});


module.exports = router;
