import React, { useState, useEffect } from "react";
import io from "socket.io-client";
import axios from "axios";
import "./Chat.css";
import ParticipantsModal from './ParticipantsModal'; 

let socket;

function Chat({ selectedChat, currentUser }) {
  const [message, setMessage] = useState("");
  const [chat, setChat] = useState([]);
  const [isGroupChat, setIsGroupChat] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [participants, setParticipants] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const [file, setFile] = useState(null);  // New state for file upload
  const [fileUrl, setFileUrl] = useState(null);  // URL for uploaded file
  const [contextMenu, setContextMenu] = useState(null);
  const [messageToDelete, setMessageToDelete] = useState(null); 
  const [showParticipantsModal, setShowParticipantsModal] = useState(false); // Modal visibility state


  const selectedUserId =
    selectedChat && selectedChat.participants && selectedChat.participants.length === 2
      ? selectedChat.participants.find((p) => p._id !== currentUser.id)._id
      : selectedChat && !selectedChat.participants
      ? selectedChat._id
      : null;

  const selectedRoomId =
    selectedChat && selectedChat.participants && selectedChat.participants.length > 2
      ? selectedChat._id
      : null;

  useEffect(() => {
    if (selectedChat) {
      if (selectedChat.participants && selectedChat.participants.length > 2) {
        setIsGroupChat(true);
        setRoomName(selectedChat.name);
        setParticipants(selectedChat.participants.map((p) => p.user));
        setIsAdmin(selectedChat.admin === currentUser.id);
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
      axios
        .get(`http://localhost:8080/api/chat/${currentUser.id}/one-on-one/${selectedUserId}`)
        .then((res) => {
          setChat(res.data);
        })
        .catch((err) => console.error("Error fetching 1-on-1 chat history:", err));
    } else if (selectedRoomId) {
      axios
        .get(`http://localhost:8080/api/chat/roomChat/history/${selectedRoomId}?userId=${currentUser.id}`)
        .then((res) => {
          setChat(res.data.chats);
        })
        .catch((err) => console.error("Error fetching group chat history:", err));
    }
  }, [selectedUserId, selectedRoomId, currentUser]);

  useEffect(() => {
    socket.on("message_deleted", (messageId) => {
      setChat((prevChat) => prevChat.filter((msg) => msg._id !== messageId));
    });
  }, []);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (contextMenu && !e.target.closest(".context-menu")) {
        setContextMenu(null);  // Close context menu if click is outside
      }
    };

    document.addEventListener("click", handleClickOutside);

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [contextMenu]);
  

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
  
    const formData = new FormData();
    formData.append("file", selectedFile);
  
    axios
      .post("http://localhost:8080/api/files/upload", formData)
      .then((res) => {
        const { fileUrl } = res.data; // Get the file URL from the server

        
        setFileUrl(fileUrl);  // Save the file URL to state
      })
      .catch((err) => console.error("Error uploading file:", err));
  };
  
  const sendMessage = () => {
    if (!currentUser || (!selectedUserId && !selectedRoomId)) {
      console.log("No user or room selected.");
      return;
    }
  
    // Ensure the message and participants are included
    if (message.trim() !== "" || fileUrl) {
      console.log("fileUrl", fileUrl);  // Check fileUrl before sending the message
      console.log("participants", participants);  // Check participants before sending
      
      // Ensure participants are included in the message
      let chatMessage = {
        sender: currentUser.id,
        message: message.trim() !== "" ? message : "",  // Ensure message is at least an empty string
        timestamp: new Date(),
        fileUrl: fileUrl, // Add file URL if file is uploaded
        fileName: file ? file.name : null, // Add file name
        participants: selectedRoomId ? participants : [currentUser.id, selectedUserId]  // Add participants dynamically
      };
  
      console.log("chatMessage", chatMessage); // Log the chat message to ensure it has all fields
  
      // Send message with valid participants and message
      socket.emit("send_message", chatMessage);
      setChat((prevChat) => [...prevChat, chatMessage]);
      setMessage("");  // Clear message input
      setFile(null);  // Clear the file input
      setFileUrl(null);  // Clear file URL
    }
  };
  
  
  const handleRightClick = (e, message) => {

    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, message });
    setMessageToDelete(message); 
  };

  // Handle "Delete" option click
  const handleDeleteMessage = async () => {
    if (!messageToDelete) return;

    try {
      // Send a request to the backend to delete the message

      await axios.delete(`http://localhost:8080/api/delete/messages/${messageToDelete._id}`);

      // Remove the message from frontend state
      setChat((prevChat) => prevChat.filter((msg) => msg._id !== messageToDelete._id));

      // Close the context menu
      setContextMenu(null);
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };
  

  const handleGroupNameClick = () => {
    setShowParticipantsModal(true); // Show the modal when group name is clicked
  };


  const leaveGroup = async () => {
    try {
      // Send request to backend to leave the group


      await axios.post("http://localhost:8080/api/chat/leave-group", {
        userId: currentUser.id,
        roomId: selectedRoomId,
      });

      // Remove the user from the participants list
      setParticipants((prevParticipants) =>
        prevParticipants.filter((participant) => participant._id !== currentUser.id)
      );

      // Optionally, handle removing the user from the UI or redirect to another page
      // For example, navigate to another chat or show a confirmation message

      alert("You have left the group.");
    } catch (err) {
      console.error("Error leaving the group:", err);
      alert("Error leaving the group.");
    }
  };

  const renderLeaveButton = () => {
    if (isGroupChat) {
      return (
        <button className="leave-group-btn" onClick={leaveGroup}>
        Leave Group
      </button>
      );
    }
  };
  
  
    

  

  return (
    <div className="chat-window">
      <h2 onClick={handleGroupNameClick}>{isGroupChat ? `Group Chat: ${roomName}` : "1-on-1 Chat"}</h2>

      <div className="chat-messages">
        {chat.map((msg, index) => (
          <div
            key={index}
            className={`chat-message ${msg.sender === currentUser.id ? "self" : ""}`}
            onContextMenu={(e) => handleRightClick(e, msg)}
          >
            <span className="sender">{msg.sender === currentUser.id ? "You" : msg.sender}</span>
            <div className="message">{msg.message}</div>
            {msg.fileUrl && (
              <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                Download {msg.fileName}
              </a>
            )}
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
        <input type="file" onChange={handleFileChange} />
        <button onClick={sendMessage}>Send</button>
      </div>

        {/* Context Menu for Delete */}
      {contextMenu && (
        <div
          style={{
            position: "absolute",
            top: contextMenu.y,
            left: contextMenu.x,
            backgroundColor: "white",
            border: "1px solid #ccc",
            padding: "10px",
            boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
          }}
        >
          <button onClick={handleDeleteMessage}>Delete Message</button>
        </div>
      )}
      {renderLeaveButton()}

    {/* Participants Modal */}
    {showParticipantsModal && (
        <ParticipantsModal
          participants={participants}
          onClose={() => setShowParticipantsModal(false)}
        />
      )}

    </div>
  );
}

export default Chat;
