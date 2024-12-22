// useUserProfile.js
import { useState, useEffect } from "react";
import axios from "axios";

const useUserProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      setError("You are not logged in.");
      setLoading(false);
      return;
    }

    // Fetch user profile from backend
    axios
      .get("http://localhost:8080/api/auth/profile", {
        headers: {
          Authorization: `Bearer ${token}`, // Send token for authentication
        },
      })
      .then((response) => {
        setUser(response.data); // Assuming the backend sends user data
        setLoading(false);
      })
      .catch((err) => {
        setError("Failed to load user profile.");
        setLoading(false);
      });
  }, []);

  return { user, loading, error };
};

export default useUserProfile;  // Ensure you're exporting the hook correctly
