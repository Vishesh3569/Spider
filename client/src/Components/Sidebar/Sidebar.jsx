import React, { useState, useEffect } from "react";
import axios from "axios";
import "./Sidebar.css";

function Sidebar({ currentUser, onSelectChat }) {
  const [search, setSearch] = useState("");
  const [chats, setChats] = useState([]); // Store the chats with participants
  const [users, setUsers] = useState([]); // Store the search results for users
  const [groups, setGroups] = useState([]); // Store groups if needed

  // Fetch chats and groups on component mount
  useEffect(() => {
    const fetchChatsAndGroups = async () => {
      try {
        const response = await axios.get(`http://localhost:8080/api/chat/${currentUser.id}`);
       
  
        // Extract participants and ensure they have the required properties
        const allParticipants = response.data.flatMap((chat) => chat.participants.map((participant) => ({
          ...participant,
          name: participant.name || "Unknown User", // Assign a fallback name if not provided
        })));

        
  
        // Remove duplicates based on `_id`
        const uniqueParticipants = [
          ...new Map(allParticipants.map((participant) => [participant._id, participant])).values(),
        ];

  
        setChats(uniqueParticipants); // Store unique participants in the chats state
        const gdata=response.data.filter((chat) => chat.participants.length > 2);
        
        setGroups(gdata); // Handle groups (optional)
        
      } catch (error) {
        console.error("Error fetching chats and groups:", error);
      }
    };
  
    fetchChatsAndGroups();
  }, [currentUser]);
  

  // Handle search input changes
  const handleSearchChange = async (e) => {
    const query = e.target.value;
    setSearch(query);

    if (query.length >= 3) {
      try {
        const response = await axios.get("http://localhost:8080/api/users/search", {
          params: { name: query }, // Send query as the name
        });
        setUsers(response.data); // Update search results
      } catch (error) {
        console.error("Error searching users:", error);
      }
    } else {
      setUsers([]); // Clear search results if query is less than 3 characters
    }
  };

  // Select a user for 1-on-1 chat
  const handleSelectUser = (user) => {
    // Check if the user is already in the chats list
    const existingChat = chats.find((chat) => chat._id === user._id);
  
    if (!existingChat) {
      // Ensure the user object has the required properties (like `name`)
      const newUser = {
        ...user,
        name: user.name || "Unknown User", // Assign a fallback name if not provided
      };
  
      // Add the new user to the chats state
      setChats([...chats, newUser]);
    }
  
    onSelectChat(user); // Select the chat for the user
  };
  

  // Select a group chat
  const handleSelectGroup = (group) => {

    onSelectChat(group); // Pass selected group chat
  };

  return (
    <div className="sidebar">
      <input
        type="text"
        className="search-bar"
        placeholder="Search or start new chat"
        value={search}
        onChange={handleSearchChange} // Update search on change
      />
      
      <h3>Chats</h3>
      <ul className="chat-list">
        {chats.map((user) => (
          <li key={user._id} onClick={() => handleSelectUser(user)}>

            <span>{user.name}</span>
          </li>
        ))}
      </ul>

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


