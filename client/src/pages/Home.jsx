import React from "react";
import "./Home.css";

const Home = () => {
  return (
    <div className="home-container">
      <div className="text-section">
        <h1>This is a Project for Spider</h1>
      </div>
      <div className="button-container">
        <button className="home-button" onClick={() => window.location.href = "/login"}>
          Login
        </button>
        <button className="home-button" onClick={() => window.location.href = "/register"}>
          Register
        </button>
      </div>
    </div>
  );
};

export default Home;
