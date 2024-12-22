import React, { useState } from "react";
import { loginUser } from "../services/authService.js"; // Import the login API service
import '../styles/login.css';

const Login = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");


  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent page reload on form submit
    try {
      // Call loginUser method from authService
      const res = await loginUser({ email, password });
      localStorage.setItem("token", res.data.token); // Save token to localStorage (or use Redux, Context API)
      onLogin(); // Trigger post-login action (like navigating to the profile page or dashboard)
    } catch (err) {
      console.error("Error during login:", err.response ? err.response.data.message : err.message);
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit}>
        <h1>Login</h1> {/* Title for login */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
