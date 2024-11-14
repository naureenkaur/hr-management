const jwt = require('jsonwebtoken');
const TOKEN_SECRET = 'your_jwt_secret'; 

const authenticateToken = (req, res, next) => {
  // Get token from the authorization header
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) return res.status(401).json({ message: 'Access denied' });

  jwt.verify(token, TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });
    req.user = user;
    next();
  });
};

module.exports = authenticateToken;
