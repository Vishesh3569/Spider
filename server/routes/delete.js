const express = require("express");
const router = express.Router();
const Chat = require("../models/Chat");  // Import your Chat model

module.exports = (io) => {  // Export a function that accepts io as an argument

  // DELETE Message API
  router.delete("/messages/:id", async (req, res) => {
    try {
      const messageId = req.params.id; // Extract message ID from the URL params

      // Find and delete the message in the database
      const deletedMessage = await Chat.findByIdAndDelete(messageId);

      if (!deletedMessage) {
        return res.status(404).json({ message: "Message not found" }); // If message doesn't exist
      }

      // Respond with a success message or the deleted message data
      res.status(200).json({ message: "Message deleted successfully", messageId });
      
      // Emit to the frontend that the message has been deleted
      io.emit("message_deleted", messageId);

    } catch (error) {
      console.error("Error deleting message:", error);
      res.status(500).json({ message: "Server error" }); // Server error response
    }
  });

  return router;
};
