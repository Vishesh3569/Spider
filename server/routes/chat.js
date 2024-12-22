const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat"); // Chat model
const Room = require("../models/Room"); // Room model
const User = require("../models/User"); // User model (for group participants)
const mongoose = require('mongoose');




// @route   GET /api/chat/:userId
// @desc    Fetch chats for a specific user



router.get("/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Convert userId to ObjectId using 'new' keyword
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Fetch group chats where the user is a participant
    const groups = await Room.find({
      participants: userObjectId,  // Use the ObjectId here
    }).populate("participants", "name email avatar"); // Populate participants
    


    // Fetch 1-on-1 chats (same as before)
    const chats = await Chat.find({
      participants: userObjectId,  // Use the ObjectId here as well
    })
      .populate("participants", "name email avatar") // Populate participant details
      .sort({ timestamp: -1 }); // Sort chats by timestamp

    const combinedChats = [...chats, ...groups]; // Combine 1-on-1 and group chats

    if (combinedChats.length === 0) {
      return res.status(404).json({ message: "No chats found for this user." });
    }

    res.json(combinedChats); // Send combined chats to the client
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});





// @route   POST /api/chat/create-group
// @desc    Create a new group chat
router.post("/create-group", async (req, res) => {
  const { name, participants } = req.body;

  try {
    // Create a new room for the group chat
    const room = new Room({
      name,
      participants,
      allowChatHistory: true, // Option to allow chat history for the group
    });

    const savedRoom =await room.save();
    res.json({ message: "Group created successfully", savedRoom });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating group" });
  }
});

// @route   GET /api/chat/history/:room
// @desc    Fetch chat history for a room (1-on-1 or group)
router.get("/roomChat/history/:room", async (req, res) => {
  const { room } = req.params;

  try {
    let roomData;
    if (mongoose.Types.ObjectId.isValid(room)) {
      // If the room is an ObjectId, find by _id
      roomData = await Room.findById(room);
    } else {
      // If the room is a name, find by name
      roomData = await Room.findOne({ name: room });
    }

    if (!roomData) {
      return res.status(404).json({ message: "Room not found" });
    }

    if (!roomData.allowChatHistory) {
      return res.status(403).json({ message: "Chat history is restricted for new users." });
    }

    // Use the participants array from the Room schema to find chats
    const chatHistory = await Chat.find({
      participants: { $all: roomData.participants }, // Matches all participants in the group
    }).sort({ timestamp: 1 });

    res.json(chatHistory);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});



// @route   POST /api/chat/send-message
// @desc    Send a message to a room (1-on-1 or group)
router.post("/send-message", async (req, res) => {
  const { room, sender, message } = req.body;

  try {
    const roomData = await Room.findOne({ name: room });

    if (!roomData) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Create a new chat message with multiple participants
    const chatMessage = new Chat({
      room: roomData.name, // Use the room name for the group
      sender: sender, // Sender is the user ID
      message: message,
      timestamp: new Date(),
      participants: roomData.participants, // The message belongs to all room participants
    });

    await chatMessage.save();

    // Emit the message to the room (using socket.io if needed)
    io.to(roomData.name).emit("receive_message", chatMessage); // Broadcasting to all participants

    res.json({ message: "Message sent successfully", chatMessage });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while sending message" });
  }
});


// @route   POST /api/chat/join-room
// @desc    Join an existing room
router.post("/join-room", async (req, res) => {
  const { roomName, userId } = req.body;

  try {
    const room = await Room.findOne({ name: roomName });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Add the user to the room's participants (if they aren't already)
    if (!room.participants.includes(userId)) {
      room.participants.push(userId);
      await room.save();
    }

    res.json({ message: "Joined room successfully", room });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error joining room" });
  }
});

module.exports = router;
