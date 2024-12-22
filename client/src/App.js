import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Profile from "./Components/Profile";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import PrivateRoute from "./Components/PrivateRoute"; // Import PrivateRoute
import Home from "./pages/Home";

import ChatPage from "./pages/ChatPage";

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path='/chat' element={<PrivateRoute element={<ChatPage />} /> } />
        <Route path='/' element={<Home />} />
        <Route path="/login" element={<Login/>} />
        <Route path="/register" element={<Signup/>} />
        <Route path="/profile" element={<PrivateRoute element={<Profile />} />} />

      </Routes>
    </Router>
  );
};

export default App;
