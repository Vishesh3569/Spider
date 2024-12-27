
const Chat = require("../models/Chat");
const Room = require("../models/Room");

exports.toggleChatHistory = async (req, res) => {
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
};




exports.addParticipants = async (req, res) => {
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
};




exports.getRoomChats = async (req, res) => {
    const { roomId } = req.params;
    const { userId } = req.query; // User ID passed as a query parameter

  
    try {
      // Find the room and ensure it exists
      const room = await Room.findById(roomId); // No need for populate since structure is different

  
      if (!room) {
        return res.status(404).json({ message: "Room not found" });
      }
  
      // Check the structure of participants

  
      // Check if the user is a participant of the room
      const participant = room.participants.find(p => p._id.toString() === userId);

  
      if (!participant) {
        return res.status(403).json({ message: "User not a participant of this room" });
      }
  
      // Fetch chats where participants match the room participants
      const roomParticipantIds = room.participants.map(p => p._id.toString());

  
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
  };
  
    
  
