const mongoose = require("mongoose");

const RoomSchema = new mongoose.Schema({
  name: { type: String, required: true }, // Room name (group name or private room)
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Array of user IDs
  allowChatHistory: { type: Boolean, default: true }, // Flag to indicate if history is allowed
});

module.exports = mongoose.model("Room", RoomSchema);
