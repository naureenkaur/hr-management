const express = require('express');
const cors = require('cors'); // Import the CORS middleware
const dotenv = require('dotenv');
const authRoutes = require('./api/authRoutes');
const employeeRoutes = require('./api/employeeRoutes');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for requests from localhost:3000
app.use(cors({ origin: 'http://localhost:3000' }));

app.use(express.json());

// Register authentication routes
app.use('/api', authRoutes);

// Register employee routes
app.use('/api/employees', employeeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
