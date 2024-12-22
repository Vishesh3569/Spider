import React from "react";
import Login from '../Components/Login';
import { useNavigate } from "react-router-dom"; // Assuming you're using React Router

const LoginPage = () => {
  const navigate = useNavigate();

  // Define the onLogin function to handle post-login behavior
  const onLogin = () => {
    navigate("/chat"); // Redirect the user to a dashboard or another protected route
  };

  return (
    <div>
      <Login onLogin={onLogin} />
    </div>
  );
};

export default LoginPage;
