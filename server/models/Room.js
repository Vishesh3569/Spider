const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Room name (group name or private room)
  participants: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      joinedAt: { type: Date, default: Date.now }, // Track when a user joined
    },
  ],
  admin: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Admin user ID
  allowChatHistory: { type: Boolean, default: true }, // Flag to indicate if history is allowed
});

module.exports = mongoose.model("Room", RoomSchema);
