const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const Chat = require("./models/Chat");
const Room = require("./models/Room"); // Import Room model
const jwt = require("jsonwebtoken");
const userAuthRoutes = require("./routes/userAuth");
const userRoutes = require("./routes/userRoutes");
const message=require("./routes/message");
const rooms=require('./routes/room');
const fileRoutes = require("./routes/fileRoute");
const deleteMessage=require("./routes/delete");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
connectDB();

// Routes
app.use("/api/auth",userAuthRoutes);
app.use("/api/chat", require("./routes/chat"));
app.use("/api/room", require("./routes/room"));
app.use('/api/users', userRoutes);
app.use('/api/chat/history',message);
app.use('/api/new',rooms);
app.use("/api/files", fileRoutes);


const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});
app.use("/api/delete",deleteMessage(io));

// Middleware for authentication
// io.use((socket, next) => {
//   const token = socket.handshake.auth?.token;
//   if (!token) {
//     return next(new Error("Authentication error"));
//   }
//   try {
//     const user = jwt.verify(token, process.env.JWT_SECRET);
//     socket.user = user;
//     next();
//   } catch (error) {
//     next(new Error("Invalid token"));
//   }
// });

// Socket.IO events
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("join_room", async (roomName) => {
    let room = await Room.findOne({ name: roomName });
    if (!room) {
      room = new Room({ name: roomName });
      await room.save();
    }
    const chatHistory = await Chat.find({ room: roomName }).sort({ createdAt: 1 });
    socket.emit("chat_history", chatHistory);
    socket.join(roomName);
  });

  socket.on("send_message", async (data) => {
    try {
      const { participants, sender, message, fileUrl, fileName, timestamp, roomId } = data;

  
      // If no message is provided, set it to an empty string
      const messageText = message.trim() !== "" ? message : null;  // If message is empty, set to null
  
      // If both message and fileUrl are empty, don't save the message
      if (!messageText && !fileUrl) {
        console.log("No message or file to send.");
        return;
      }
  
      // Save the message to the database with either a valid message or fileUrl
      const chatMessage = new Chat({
        participants,
        sender,
        message: messageText,  // Save the message if it's not empty
        fileUrl: fileUrl || null, // Save file URL if provided, else null
        fileName, // Save the file name if provided
        timestamp,
      });
  
      await chatMessage.save();
  
      // Emit the message back to all participants
      participants.forEach((participant) => {
        io.to(participant.toString()).emit("receive_message", chatMessage);
      });
  
      // Optionally: Update the Room's chat history if needed
      if (roomId) {
        await Room.findByIdAndUpdate(
          roomId,
          { $push: { chatHistory: chatMessage._id } },
          { new: true }
        );
      }
    } catch (error) {
      console.error("Error saving message:", error);
    }
  });
  

  socket.on("delete_message", async (messageId) => {
    try {
      // Delete the message from the database
      const deletedMessage = await Chat.findByIdAndDelete(messageId);

      if (deletedMessage) {
        // Broadcast to all clients that the message has been deleted
        io.emit("message_deleted", messageId);
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  });
  
  

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
