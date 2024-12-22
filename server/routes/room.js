const express = require("express");
const router = express.Router();
const Room = require("../models/Room"); // Room model

// @route   PATCH /api/room/toggle-chat-history
// @desc    Toggle chat history visibility for a room (admin only)
router.patch("/toggle-chat-history", async (req, res) => {
  const { room, allowChatHistory } = req.body;

  try {
    const roomData = await Room.findOneAndUpdate(
      { name: room },
      { allowChatHistory },
      { new: true }
    );

    if (!roomData) {
      return res.status(404).json({ message: "Room not found" });
    }

    res.json({ message: "Chat history visibility updated", room: roomData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
