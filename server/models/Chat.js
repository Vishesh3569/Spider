const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  message: { type: String, default: "" },
  fileUrl: { type: String, default: null },  // Allow null if no file URL is provided
  fileName: { type: String, default: null }, // Optional file name field
  timestamp: { type: Date, required: true },
});

module.exports = mongoose.model("Chat", ChatSchema);


