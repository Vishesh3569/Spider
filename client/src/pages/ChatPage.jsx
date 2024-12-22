import React, { useState, useEffect } from "react";
import Sidebar from "../Components/Sidebar/Sidebar";
import Chat from "../Components/Chat/Chat";
import { jwtDecode } from "jwt-decode"; // Use named import now
import "../styles/chatPage.css";
import CreateGroup from "../Components/Chat/CreateGroup";

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [isCreateGroupOpen, setCreateGroupOpen] = useState(false);

  const handleOpenCreateGroup = () => {
    setCreateGroupOpen(true);
  };

  const handleCloseCreateGroup = () => {
    setCreateGroupOpen(false);
  };

  const handleGroupCreated = (newGroup) => {
    setCreateGroupOpen(false);
    setSelectedChat(newGroup); // Optionally, open the new group automatically
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setCurrentUser(decodedToken); // Set user data from the decoded JWT token
      } catch (error) {
        console.error("Error decoding token", error);
      }
    }
  }, []);

  const handleSelectChat = (chat) => {
    console.log("Selected Chat:", chat);
    setSelectedChat(chat);
  };

  if (!currentUser) {
    return <div>Loading...</div>; // You can add a loading spinner or redirect here
  }

  return (
    <div id="chat-app">
      <div className="chat-page">
        {/* "New Group" Button */}
        <button className="new-group-btn" onClick={handleOpenCreateGroup}>
          New Group
        </button>

        {isCreateGroupOpen && (
          <CreateGroup currentUser={currentUser} onGroupCreated={handleGroupCreated} />
        )}

        <div className="left-panel">
          <Sidebar currentUser={currentUser} onSelectChat={handleSelectChat} />
        </div>

        <div className="right-panel">
          {selectedChat ? (
            <Chat selectedChat={selectedChat} currentUser={currentUser} />
          ) : (
            <div className="no-chat-selected">
              <h3>Select a user to start a new chat</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
