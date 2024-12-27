import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Sidebar.css";

function Sidebar({ currentUser, onSelectChat }) {
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState([]);
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [oneOnOneChats, setOneOnOneChats] = useState([]); // State for 1-on-1 chats

  useEffect(() => {
    const fetchChatsAndGroups = async () => {
      try {
        // Fetch group chats
        const response = await axios.get(
          `http://localhost:8080/api/chat/groupChats/${currentUser.id}`
        );
        const allGroups = response.data;
        setGroups(allGroups);

        // Fetch 1-on-1 chats
        const oneOnOneResponse = await axios.get(
          `http://localhost:8080/api/chat/one-on-one/${currentUser.id}`
        );

        // Remove duplicate participants
        const uniqueChats = oneOnOneResponse.data.reduce((acc, chat) => {
          const otherParticipant = chat.participants.find(
            (participant) => participant._id !== currentUser.id
          );
          if (
            otherParticipant &&
            !acc.some((c) => c.participantId === otherParticipant._id)
          ) {
            acc.push({ participantId: otherParticipant._id, name: otherParticipant.name, chat });
          }
          return acc;
        }, []);
        setOneOnOneChats(uniqueChats);
      } catch (error) {
        console.error("Error fetching chats and groups:", error);
      }
    };

    fetchChatsAndGroups();
  }, [currentUser]);

  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearch(query);

    if (query.length >= 3) {
      try {
        const response = await axios.get("http://localhost:8080/api/users/search", {
          params: { name: query },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error searching users:", error);
      }
    } else {
      setUsers([]);
    }
  };

  const handleSelectUser = (chat) => {

    onSelectChat(chat);
  };

  const handleSelectGroup = (group) => {
    onSelectChat(group);
  };

  return (
    <div className="sidebar">
      <input
        type="text"
        className="search-bar"
        placeholder="Search or start new chat"
        value={search}
        onChange={handleSearchChange}
      />

      <h3>1-on-1 Chats</h3>
      {oneOnOneChats.length > 0 ? (
        <ul className="chat-list">
          {oneOnOneChats.map(({ participantId, name, chat }) => (
            <li key={participantId} onClick={() => handleSelectUser(chat)}>
              <span>{name || "Unknown"}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p>No one-on-one chats available.</p>
      )}

      <h3>Search Results</h3>
      <ul className="user-list">
        {users.map((user) => (
          <li key={user._id} onClick={() => handleSelectUser(user)}>
            <span>{user.name}</span>
          </li>
        ))}
      </ul>

      <h3>Groups</h3>
      <ul className="group-list">
        {groups.map((group) => (
          <li key={group._id} onClick={() => handleSelectGroup(group)}>
            <span>{group.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Sidebar;
