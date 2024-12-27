import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./Chat.css";

let socket;

function Chat({ selectedChat, currentUser }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [participants, setParticipants] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  // New states for search functionality
  const [searchQuery, setSearchQuery] = useState(""); // For user search
  const [searchResults, setSearchResults] = useState([]); // To hold search results

 

  const selectedUserId =
    selectedChat && selectedChat.participants && selectedChat.participants.length === 2
      ? selectedChat.participants.find((p) => p._id !== currentUser.id)._id // For 1-on-1 chats, find the other participant
      : selectedChat && !selectedChat.participants
      ? selectedChat._id // If it's a user (no participants field), use the user _id
      : null;



const selectedRoomId =
  selectedChat && selectedChat.participants && selectedChat.participants.length > 2
    ? selectedChat._id  // For group chats, use the chat ID as room ID
    : null; // For group chat, get the room ID




  useEffect(() => {
    if (selectedChat) {
      if (selectedChat.participants && selectedChat.participants.length > 2) {
        setIsGroupChat(true);
        setRoomName(selectedChat.name);
        setParticipants(selectedChat.participants.map((p) => p.user));
        setIsAdmin(selectedChat.admin === currentUser.id); // Check if the user is admin
      } else {
        setIsGroupChat(false);
      }
    }
  }, [selectedChat, currentUser]);

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
        socket.disconnect();
      };
    }
  }, [selectedUserId, selectedRoomId]);

  useEffect(() => {
    if (selectedUserId) {
      // Fetch chat history for 1-on-1 chat
      axios
        .get(`http://localhost:8080/api/chat/${currentUser.id}/one-on-one/${selectedUserId}`)
        .then((res) => {
          setChat(res.data);
        })
        .catch((err) => console.error("Error fetching 1-on-1 chat history:", err));
    } else if (selectedRoomId) {
      // Fetch group chat history
      axios
        .get(`http://localhost:8080/api/chat/roomChat/history/${selectedRoomId}?userId=${currentUser.id}`)
        .then((res) => {
          setChat(res.data.chats); // Assuming response has 'chats' property
        })
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
        // One-on-one message format
        chatMessage = {
          participants: [currentUser.id, selectedUserId],
          sender: currentUser.id,
          message,
          timestamp: new Date(),
        };
      } else if (selectedRoomId) {
        // Group message format
        chatMessage = {
          participants, // Participants should be fetched from selectedRoomId
          roomId: selectedRoomId,
          sender: currentUser.id,
          message,
          timestamp: new Date(),
        };
      }
  
      socket.emit("send_message", chatMessage);
  
      setChat((prevChat) => [...prevChat, chatMessage]);
  
      setMessage("");
    }
  };
  

  // Function to toggle chat history
  const toggleChatHistory = (allowChatHistory) => {
    axios
      .post(`http://localhost:8080/api/chat/toggle-history/${selectedRoomId}`, {
        adminId: currentUser.id,
        allowChatHistory,
      })
      .then((res) => {
        console.log("Chat history toggled:", res.data);
        alert(`Chat history is now ${allowChatHistory ? "enabled" : "disabled"} for new users.`);
      })
      .catch((err) => console.error("Error toggling chat history:", err));
  };

  // Function to add participant by selecting from search results
  const addParticipant = (newParticipantId) => {
    if (!newParticipantId) {
      alert("Please select a valid participant.");
      return;
    }

    axios
      .post(`http://localhost:8080/api/chat/room/${selectedRoomId}/add-participant`, {
        adminId: currentUser.id,
        newParticipantIds: [newParticipantId],
      })
      .then((res) => {
        console.log("Participant added:", res.data);
        alert("Participant added successfully!");
      })
      .catch((err) => {
        console.error("Error adding participant:", err);
        alert("There was an error adding the participant.");
      });
  };

  // Fetch users based on search query
  useEffect(() => {
    if (searchQuery) {
      axios
        .get(`http://localhost:8080/api/chat/search-users/${searchQuery}`)
        .then((res) => setSearchResults(res.data))
        .catch((err) => console.error("Error searching for users:", err));
    } else {
      setSearchResults([]); // Clear search results when query is empty
    }
  }, [searchQuery]);

  return (
    <div className="chat-window">
      <h2>{isGroupChat ? `Group Chat: ${roomName}` : "1-on-1 Chat"}</h2>

      {isAdmin && isGroupChat && (
        <div className="admin-controls">
          {/* Search for users to add to the group */}
          <input
            type="text"
            placeholder="Search for a participant"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          {searchResults.length > 0 && (
            <ul className="search-results">
              {searchResults.map((user) => (
                <li key={user._id}>
                  <button onClick={() => addParticipant(user._id)}>
                    {user.name} ({user.email})
                  </button>
                </li>
              ))}
            </ul>
          )}

          {/* Toggle chat history */}
          <button onClick={() => toggleChatHistory(true)}>Enable History</button>
          <button onClick={() => toggleChatHistory(false)}>Disable History</button>
        </div>
      )}

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
