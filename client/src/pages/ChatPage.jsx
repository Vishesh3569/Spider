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

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setCurrentUser(decodedToken);
      } catch (error) {
        console.error("Error decoding token", error);
      }
    }
  }, []);

  const handleOpenCreateGroup = () => {
    setCreateGroupOpen(true);
  };

  const handleCloseCreateGroup = () => {
    setCreateGroupOpen(false);
  };

  const handleGroupCreated = (newGroup) => {
    setCreateGroupOpen(false);
    setSelectedChat(newGroup);
  };

  const handleSelectChat = (chat) => {
    setSelectedChat(chat);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div id="chat-app">
      <div className="chat-page">
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
              <h3>Select a chat or group to start</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
