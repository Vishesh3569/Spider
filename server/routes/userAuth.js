const express = require("express");
const router = express.Router();
const { registerUser, loginUser, getUserProfile } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");

// User registration
router.post("/register", registerUser);

// User login
router.post("/login", loginUser);

// Get user profile (protected route)
router.get("/profile", authMiddleware, getUserProfile);

module.exports = router;
