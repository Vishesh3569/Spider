const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const token = req.header("Authorization");

  // Ensure the token starts with 'Bearer ' and extract the token
  if (!token || !token.startsWith("Bearer ")) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const actualToken = token.split(" ")[1]; // Extract the token from 'Bearer <token>'

  try {
    const decoded = jwt.verify(actualToken, process.env.JWT_SECRET); // Verify the token using the secret
    req.user = decoded; // Attach decoded user data to the request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    res.status(401).json({ message: "Token is not valid" }); // Invalid token
  }
};

module.exports = authMiddleware;
