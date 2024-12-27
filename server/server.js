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

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

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
      const { participants, sender, message, timestamp, roomId } = data;
  
      // Save the message to the database
      const chatMessage = new Chat({
        participants, // Save participants array
        sender,
        message,
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
  

  socket.on("disconnect", () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
