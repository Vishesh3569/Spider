import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./Chat.css";

let socket;

function Chat({ selectedChat, currentUser }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false); // For checking if it's a group chat
  const [roomName, setRoomName] = useState(""); // For group chat name

  const selectedUserId =
    selectedChat && selectedChat._id && !selectedChat.participants
      ? selectedChat._id
      : null; // 1-on-1 chat ID
  const selectedRoomId =
    selectedChat && selectedChat._id && selectedChat.participants
      ? selectedChat._id
      : null; // Group chat ID

  useEffect(() => {
    if (selectedChat) {
      if (selectedChat.participants && selectedChat.participants.length > 2) {
        setIsGroupChat(true); // It's a group chat
        setRoomName(selectedChat.name); // Set the group name if applicable
      } else {
        setIsGroupChat(false); // It's a 1-on-1 chat
      }
    }
  }, [selectedChat]);

  useEffect(() => {
    if (selectedUserId || selectedRoomId) {
      socket = io("http://localhost:8080", { reconnection: true });

      socket.on("receive_message", (data) => {
        setChat((prevChat) => [...prevChat, data]);
      });

      socket.on("connect_error", (err) => {
        console.error("Socket connection error:", err);
      });

      return () => {
        socket.disconnect(); // Cleanup on component unmount
      };
    }
  }, [selectedUserId, selectedRoomId]);

  useEffect(() => {
    if (selectedUserId) {
      axios
        .get(
          `http://localhost:8080/api/chat/history/messages/${currentUser.id}/${selectedUserId}`
        )
        .then((res) => setChat(res.data))
        .catch((err) => console.error("Error fetching chat history:", err));
    } else if (selectedRoomId) {
      axios
        .get(`http://localhost:8080/api/chat/roomChat/history/${selectedRoomId}`)
        .then((res) => setChat(res.data))
        .catch((err) => console.error("Error fetching group chat history:", err));
    }
  }, [selectedUserId, selectedRoomId, currentUser]);

  const sendMessage = () => {
    if (!currentUser || (!selectedUserId && !selectedRoomId)) {
      console.log("No user or room selected.");
      return;
    }

    if (message.trim() !== "") {
      let chatMessage;

      if (selectedUserId) {
        chatMessage = {
          participants: [currentUser.id, selectedUserId],
          sender: currentUser.id,
          message,
          timestamp: new Date(),
        };
      } else if (selectedRoomId) {
        chatMessage = {
          participants: selectedChat.participants.map((p) => p._id),
          roomId: selectedRoomId,
          sender: currentUser.id,
          message,
          timestamp: new Date(),
        };
      }

      socket.emit("send_message", chatMessage);

      setChat((prevChat) => [...prevChat, chatMessage]);

      setMessage(""); // Clear the input field
    }
  };

  return (
    <div className="chat-window">
      <h2>{isGroupChat ? `Group Chat: ${roomName}` : "1-on-1 Chat"}</h2>
      <div className="chat-messages">
        {chat.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === currentUser.id ? "self" : ""}`}
          >
            <span className="sender">
              {msg.sender === currentUser.id ? "You" : msg.sender}
            </span>
            <div className="message">{msg.message}</div>
            <span className="timestamp">
              {new Date(msg.timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        ))}
      </div>
      <div className="message-controls">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}

export default Chat;
