const jwt = require("jsonwebtoken");
require('dotenv').config();

// Function to verify the JWT token
function verifyJWT(req, res, next) {
  // Get the token from the request headers (assuming Authorization: Bearer <token>)
  const token = req.headers.authorization && req.headers.authorization.split(" ")[1]; 

  // Check if there is a token, if not, return status 401 and Unauthorized message
  if (!token) {
    return res.status(401).json({ message: "Unauthorized: No token provided" });
  }

  // Verify whether the token is correct
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    // If error, return status 403 and Forbidden message
    if (err) {
      console.error("Token verification failed:", err);
      return res.status(403).json({ message: "Forbidden: Invalid or expired token" });
    }

    // Assuming your token contains 'user_id' and 'name'
    req.userId = decoded.user_id;  // Extract user_id from token
    req.userName = decoded.name;   // Extract user name from token
    
    next(); // Proceed to the next middleware or controller
  });
}

module.exports = verifyJWT; // Export the verifyJWT function

