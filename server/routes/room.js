const express = require("express");
const router = express.Router();
const { toggleChatHistory, addParticipants, getRoomChats } = require("../controllers/roomController");

// Toggle chat history
router.post("/rooms/:roomId/toggleChatHistory", toggleChatHistory);

// Add participants
router.post("/rooms/:roomId/addParticipants", addParticipants);

// Get room chats
router.get("/rooms/:roomId/chats", getRoomChats);

module.exports = router;