import React, { useState, useEffect } from "react";
import { getUserProfile } from "../services/authService"; // Your API service to fetch the profile
import './Profile.css'; // Import the CSS for styling

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("token"); // Retrieve token from localStorage

      if (!token) {
        setError("You need to be logged in to view your profile.");
        setLoading(false);
        return;
      }

      try {
        const res = await getUserProfile(token); // Fetch user profile using the token
        setUser(res.data); // Set the profile data
        setLoading(false);
      } catch (err) {
        console.error("Error fetching profile:", err.response ? err.response.data.message : err.message);
        setError("Failed to load profile.");
        setLoading(false);
      }
    };

    fetchProfile();
  }, []); // Empty dependency array ensures it runs once after the component mounts

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="profile-container">
      <h2 className="profile-title">Profile</h2>
      {user && (
        <div className="profile-details">
          <div className="profile-item">
            <strong>Name:</strong> {user.name}
          </div>
          <div className="profile-item">
            <strong>Email:</strong> {user.email}
          </div>
          <div className="profile-item">
            <strong>Username:</strong> {user.username}
          </div>
          <div className="profile-item">
            <strong>Bio:</strong> {user.bio || "No bio available."}
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
