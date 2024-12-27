const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat"); // Chat model
const Room = require("../models/Room"); // Room model
const User = require("../models/User"); // User model (for group participants)
const mongoose = require('mongoose');




// @route   GET /api/chat/:userId
// @desc    Fetch chats for a specific user



// @route   GET /api/chat/one-on-one/:userId
// @desc    Fetch one-on-one chats for a specific user
// @route   GET /api/chat/one-on-one/:userId
// @desc    Fetch one-on-one chats for a specific user

router.get('/:userId/one-on-one/:otherUserId',  async (req, res) => {
  const { userId, otherUserId } = req.params;



  try {
    // Query the database for messages between the two users
    const chatHistory = await Chat.find({
      $or: [
        { participants: [userId, otherUserId] },  // Messages where userId and otherUserId are participants
        { participants: [otherUserId, userId] },  // Messages where order is reversed
      ]
    })
      .sort({ timestamp: 1 })  // Sort by timestamp (ascending)
      .exec();

    // Send the chat history as the response
    res.status(200).json(chatHistory);
  } catch (error) {
    console.error("Error fetching one-on-one chat history:", error);
    res.status(500).json({ message: "Server error, unable to fetch chat history" });
  }
});
router.get("/one-on-one/:userId", async (req, res) => {
  const { userId } = req.params;

  try {
    // Convert userId to ObjectId using 'new' keyword
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Fetch 1-on-1 chats where there are exactly two participants (including the current user)
    const chats = await Chat.find({
      participants: { $size: 2, $all: [userObjectId] },  // Ensure there are exactly two participants, including the user
    })
      .populate("participants", "name email avatar")  // Populate participant details
      .sort({ timestamp: -1 });  // Sort chats by timestamp (newest first)


    if (chats.length === 0) {
      return res.status(404).json({ message: "No one-on-one chats found for this user." });
    }

    res.json(chats);  // Send the list of one-on-one chats to the client
    
    
  } catch (err) {
    console.error("Error fetching one-on-one chats:", err);
    res.status(500).json({ message: "Server error while fetching one-on-one chats" });
  }
});







// @route   POST /api/chat/create-group
// @desc    Create a new group chat
router.post("/create-group", async (req, res) => {
  const { name, participants, admin } = req.body;

  try {
    // Validate that the admin is part of the participants array
    if (!participants.includes(admin)) {
      return res.status(400).json({ message: "Admin must be a participant of the group" });
    }

    // Add joinedAt timestamp for each participant
    const participantDetails = participants.map(participant => ({
      user: participant,
      joinedAt: new Date(),
    }));

    // Create a new room for the group chat
    const room = new Room({
      name,
      participants: participantDetails,
      admin, // Set the admin
      allowChatHistory: true, // Default to allowing chat history
    });

    const savedRoom = await room.save();
    res.json({ message: "Group created successfully", savedRoom });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error while creating group" });
  }
});


// @route   GET /api/chat/history/:room
// @desc    Fetch chat history for a room (1-on-1 or group)

router.get("/roomChat/history/:roomId", async (req, res) => {
  const { roomId } = req.params;
  const { userId } = req.query; // User ID passed as a query parameter


  try {
    // Find the room and ensure it exists
    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }



    // Check if the user is a participant of the room
    const participant = room.participants.find(p => p.user.toString() === userId);


    if (!participant) {
      return res.status(403).json({ message: "User not a participant of this room" });
    }

    // Fetch chats where participants match the room participants
    const roomParticipantIds = room.participants.map(p => p.user.toString());

    let chats = await Chat.find({
      participants: { $all: roomParticipantIds, $size: roomParticipantIds.length },
    }).sort({ timestamp: 1 });

    // Filter chats if chat history is not allowed
    if (!room.allowChatHistory) {
      const userJoinDate = participant.joinedAt;
      chats = chats.filter(chat => new Date(chat.timestamp) >= new Date(userJoinDate));
    }

    res.status(200).json({ chats });
  } catch (err) {
    console.error("Error in getRoomChats:", err);
    res.status(500).json({ message: "Server error", details: err.message });
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
router.post("/room/:roomId/add-participant", async (req, res) => {
  const { roomId } = req.params;
  const { adminId, newParticipantIds } = req.body;

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });

    if (room.admin.toString() !== adminId) {
      return res.status(403).json({ error: "Only the admin can add participants" });
    }

    const currentParticipants = room.participants.map(p => p.user.toString());
    const uniqueNewParticipants = newParticipantIds.filter(
      id => !currentParticipants.includes(id)
    );

    uniqueNewParticipants.forEach(id => {
      room.participants.push({ user: id });
    });

    await room.save();

    res.status(200).json({ message: "Participants added successfully", room });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});


router.post('/toggle-history/:roomId' ,async (req, res) => {
  const { roomId } = req.params;
  const { adminId, allowChatHistory } = req.body;

  try {
    const room = await Room.findById(roomId);
    if (!room) return res.status(404).json({ error: "Room not found" });

    if (room.admin.toString() !== adminId) {
      return res.status(403).json({ error: "Only the admin can toggle chat history" });
    }

    room.allowChatHistory = allowChatHistory;
    await room.save();

    res.status(200).json({ message: "Chat history setting updated", room });
  } catch (err) {
    res.status(500).json({ error: "Internal Server Error", details: err.message });
  }
});

router.get("/groupChats/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const groups = await Room.find({ "participants.user": userId });
    res.status(200).json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// @desc    Search users by name or email
router.get("/search-users/:query", async (req, res) => {
  const { query } = req.params;

  try {
    const users = await User.find({
      $or: [
        { name: { $regex: query, $options: "i" } }, // Search by name (case-insensitive)
        { email: { $regex: query, $options: "i" } }, // Search by email (case-insensitive)
      ],
    });

    if (users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    res.json(users); // Return the list of users
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /api/chat/one-on-one
router.post("/create/one-on-one", async (req, res) => {
  const { participants, sender, message } = req.body;

  if (!participants || participants.length !== 2 || !sender || !message) {
    return res.status(400).json({ error: "Invalid request parameters." });
  }

  try {
    // Check if a chat already exists between these participants
    let chat = await Chat.findOne({
      participants: { $all: participants, $size: 2 },
    });

    if (!chat) {
      // Create a new chat
      chat = new Chat({
        participants,
        sender,
        message,
      });
      await chat.save();
    }

    res.status(201).json(chat);
  } catch (error) {
    console.error("Error creating chat:", error);
    res.status(500).json({ error: "Error creating chat." });
  }
});



module.exports = router;
