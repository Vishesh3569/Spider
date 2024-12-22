import React, { useState } from "react";
import axios from "axios";
import './CreateGroup.css'; // Assuming you'll style the modal

const CreateGroup = ({ currentUser, onGroupCreated }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    if (e.target.value.length >= 3) {
      axios
        .get(`http://localhost:8080/api/users/search?name=${e.target.value}`)
        .then((response) => {
          setUsers(response.data);
        })
        .catch((error) => {
          console.error("Error searching users:", error);
        });
    }
  };

  const handleSelectUser = (user) => {
    setSelectedUsers((prevUsers) => [...prevUsers, user]);
  };

  const handleCreateGroup = () => {
    if (groupName.trim() && selectedUsers.length > 0) {
      const participants = selectedUsers.map((user) => user._id);
      participants.push(currentUser.id); // Add current user to the participants list
  

      axios
        .post("http://localhost:8080/api/chat/create-group", {
          name: groupName,
          participants,
        })
        .then((response) => {
          console.log("Group Created:", response.data); // Debug log
          onGroupCreated(response.data.room);
          setGroupName("");
          setSelectedUsers([]);
        })
        .catch((error) => {
          console.error("Error creating group:", error);
        });
    } else {
      alert("Please provide a group name and select participants.");
    }
  };
  

  return (
    <div className="create-group-modal">
      <h3>Create a New Group</h3>
      <input
        type="text"
        value={groupName}
        onChange={(e) => setGroupName(e.target.value)}
        placeholder="Group name"
      />
      <input
        type="text"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="Search users"
      />
      <ul className="user-list">
        {users.map((user) => (
          <li key={user._id} onClick={() => handleSelectUser(user)}>
            {user.name}
          </li>
        ))}
      </ul>
      <div className="selected-users">
        <h4>Selected Users</h4>
        <ul>
          {selectedUsers.map((user) => (
            <li key={user._id}>
              {user.name}{" "}
              <button
                onClick={() => {
                  setSelectedUsers(selectedUsers.filter((u) => u._id !== user._id));
                }}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      </div>
      <button onClick={handleCreateGroup}>Create Group</button>
    </div>
  );
};

export default CreateGroup;
