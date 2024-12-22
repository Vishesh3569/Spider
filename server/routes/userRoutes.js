const express = require('express');
const { searchUsers } = require('../controllers/userController');

const router = express.Router();

// Search users route
router.get('/search', searchUsers);

module.exports = router;
