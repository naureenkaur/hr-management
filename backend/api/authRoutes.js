const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');
const router = express.Router();

const TOKEN_SECRET = 'your_jwt_secret'; // Use a secure secret in production
const TOKEN_EXPIRATION = '15m';
const SALT_ROUNDS = 10; // Number of rounds for bcrypt hashing

// Login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const userQuery = 'SELECT * FROM hr_team WHERE username = $1';
    const { rows } = await db.query(userQuery, [username]);
    const user = rows[0];

    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Compare password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, TOKEN_SECRET, { expiresIn: TOKEN_EXPIRATION });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Register route for creating a new account
router.post('/register', async (req, res) => {
    const { username, password } = req.body;
  
    try {
      // Check if the username already exists
      const userQuery = 'SELECT * FROM hr_team WHERE username = $1';
      const { rows } = await db.query(userQuery, [username]);
      if (rows.length > 0) {
        return res.status(409).json({ message: 'Username already exists' });
      }
  
      // Hash the password
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
  
      // Insert new user into the hr_team table
      const insertQuery = 'INSERT INTO hr_team (username, password) VALUES ($1, $2)';
      await db.query(insertQuery, [username, hashedPassword]);
  
      res.status(201).json({ message: 'Account created successfully' });
    } catch (error) {
      console.error('Error during registration:', error); // Add this line for debugging
      res.status(500).json({ message: 'Internal server error' });
    }
  });
  

module.exports = router;
