import React, { useState, useEffect } from "react";
import { getUserProfile } from "../services/authService"; // Your API service to fetch the profile

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
    <div>
      <h2>Profile</h2>
      {user && (
        <div>
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
        </div>
      )}
    </div>
  );
};

export default Profile;
