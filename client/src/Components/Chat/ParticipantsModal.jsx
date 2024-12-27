import React, { useState, useEffect } from "react";
import axios from "axios";

const ParticipantsModal = ({ participants, onClose }) => {
  const [userNames, setUserNames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserNames = async () => {
      if (!participants || participants.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const response = await axios.get("http://localhost:8080/api/users/name", {
          params: { userIds: participants },
        });

        console.log("API Response:", response.data); // Log the response
        setUserNames(response.data); // Set the user names state
        setLoading(false);
      } catch (err) {
        setError("Failed to load participants.");
        setLoading(false);
        console.error("Error fetching participants:", err);
      }
    };

    fetchUserNames();
  }, [participants]);

  if (loading) {
    return <div>Loading participants...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Participants</h3>
        <ul>
          {userNames.length > 0 ? (
            userNames.map((participant) => (
              <li key={participant.id}>{participant.name}</li>  // Use participant.id as key
            ))
          ) : (
            <li>No participants found.</li>
          )}
        </ul>
        <button onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default ParticipantsModal;
