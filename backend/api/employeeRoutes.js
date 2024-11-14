const express = require('express');
const router = express.Router();
const db = require('../db'); // Import the database connection from a separate db file
const authenticateToken = require('../middleware/authenticateToken'); // Import the token authentication middleware

// GET all employees (protected route)
router.get('/', authenticateToken, (req, res) => {
  console.log('GET /api/employees called'); // Debug log
  const query = `
    SELECT e.employee_id, e.first_name, e.last_name, e.department_id, d.department_name
    FROM employees e
    LEFT JOIN departments d ON e.department_id = d.department_id;
  `;
  db.query(query, (err, results) => {
    if (err) {
      console.error('Database error:', err); // Debug log
      res.status(500).json({ error: err.message });
    } else {
      console.log('Database results:', results.rows); // Debug log
      res.json(results.rows);
    }
  });
});

// POST a new employee (protected route)
router.post('/', authenticateToken, (req, res) => {
  const { first_name, last_name, department_id } = req.body;
  db.query(
    'INSERT INTO employees (first_name, last_name, department_id) VALUES ($1, $2, $3) RETURNING *',
    [first_name, last_name, department_id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(results.rows[0]);
      }
    }
  );
});

// PUT to update an employee (protected route)
router.put('/:id', authenticateToken, (req, res) => {
  const { first_name, last_name, department_id } = req.body;
  const { id } = req.params;
  db.query(
    'UPDATE employees SET first_name = $1, last_name = $2, department_id = $3 WHERE employee_id = $4 RETURNING *',
    [first_name, last_name, department_id, id],
    (err, results) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(results.rows[0]);
      }
    }
  );
});

// DELETE an employee (protected route)
router.delete('/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  db.query('DELETE FROM employees WHERE employee_id = $1 RETURNING *', [id], (err, results) => {
    if (err) {
      res.status(500).json({ error: err.message });
    } else {
      res.json({ message: 'Employee deleted', deletedEmployee: results.rows[0] });
    }
  });
});

module.exports = router;
