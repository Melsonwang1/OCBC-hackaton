const jwt = require("jsonwebtoken");
require('dotenv').config();

// Function to verify the JWT token
function verifyJWT(req, res, next) {
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1];

  // Check if token is present
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden: Invalid or expired token" });
    }

    // Extract user_id and name from the decoded token
    req.userId = decoded.user_id;
    req.userName = decoded.name;
    
    next(); // Proceed to the next middleware or controller
  });
}

module.exports = verifyJWT;


