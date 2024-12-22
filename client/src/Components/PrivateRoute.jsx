import React from "react";
import { Navigate } from "react-router-dom";

// PrivateRoute will receive the component as a prop and check the token
const PrivateRoute = ({ element }) => {
  const token = localStorage.getItem("token"); // Check if the token exists

  if (!token) {
    return <Navigate to="/login" />; // Redirect to login if no token
  }

  // If token exists, render the element passed as prop (protected route component)
  return element;
};

export default PrivateRoute;
