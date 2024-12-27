const express = require('express');
const { searchUsers } = require('../controllers/userController');
const User = require("../models/User");

const router = express.Router();

// Search users route
router.get('/search', searchUsers);

router.get("/name", async (req, res) => {
    try {
      const { userIds } = req.query;  // Get the array of user IDs from the query params
  
      if (!userIds) {
        return res.status(400).json({ message: "No user IDs provided" });
      }
  
      // Convert userIds to an array if it's not already
      const userIdArray = Array.isArray(userIds) ? userIds : [userIds];
  
      // Fetch users from the database by their IDs
      const users = await User.find({ _id: { $in: userIdArray } });
  
      // Respond with the users' names
      res.json(users.map(user => ({ id: user._id, name: user.name })));
    } catch (err) {
      console.error("Error fetching user details:", err);
      res.status(500).json({ message: "Error fetching participants" });
    }
  });

module.exports = router;
