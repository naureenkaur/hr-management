import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Modal from 'react-modal';
import { useNavigate } from 'react-router-dom';
import './EmployeePage.css';

Modal.setAppElement('#root'); // For accessibility, specify the root element

function EmployeePage() {
  const [employees, setEmployees] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]); // For live search filtering
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false); // Modal for creating admin account
  const [currentEmployee, setCurrentEmployee] = useState(null);
  const [searchTerm, setSearchTerm] = useState(''); // For live search
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEmployees();
  }, []);

  // Fetch Employees
  const fetchEmployees = () => {
    const token = localStorage.getItem('token');
    axios.get('/api/employees', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        setEmployees(response.data);
        setFilteredEmployees(response.data); // Set filtered list initially to full list
      })
      .catch((error) => {
        console.error('Error fetching employees:', error);
        setError('Failed to load employees. Please check your authentication or connection.');
      });
  };

  // Add Employee
  const handleAddEmployee = (newEmployee) => {
    const token = localStorage.getItem('token');
    axios.post('/api/employees', newEmployee, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(fetchEmployees)
      .catch((error) => {
        console.error('Error adding employee:', error);
        setError('Failed to add employee.');
      });
    setShowAddModal(false);
  };

  // Edit Employee
  const handleEditEmployee = (updatedEmployee) => {
    const token = localStorage.getItem('token');
    axios.put(`/api/employees/${currentEmployee.employee_id}`, updatedEmployee, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(fetchEmployees)
      .catch((error) => {
        console.error('Error editing employee:', error);
        setError('Failed to edit employee.');
      });
    setShowEditModal(false);
    setCurrentEmployee(null);
  };

  // Delete Employee
  const handleDeleteEmployee = (employeeId) => {
    const token = localStorage.getItem('token');
    axios.delete(`/api/employees/${employeeId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(fetchEmployees)
      .catch((error) => {
        console.error('Error deleting employee:', error);
        setError('Failed to delete employee.');
      });
  };

  // Open Edit Modal with Employee Data
  const openEditModal = (employee) => {
    setCurrentEmployee(employee);
    setShowEditModal(true);
  };

  // Add Admin Account
  const handleAddAdmin = (newAdmin) => {
    const token = localStorage.getItem('token');
    axios.post('/api/register', newAdmin, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setShowAdminModal(false);
        alert('Admin account created successfully');
      })
      .catch((error) => {
        console.error('Error creating admin:', error);
        setError('Failed to create admin account.');
      });
  };

  // Live Search Filter
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    setFilteredEmployees(employees.filter(employee =>
      employee.first_name.toLowerCase().includes(value) ||
      employee.last_name.toLowerCase().includes(value) ||
      String(employee.employee_id).includes(value) ||
      (employee.department_name && employee.department_name.toLowerCase().includes(value)) || // Filter by department name
      String(employee.department_id).includes(value) // Filter by department ID
    ));
  };

  // Logout function
  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login'); // Redirect to login page
  };

  return (
    <div className="employee-page">
      <header className="page-header">
        <h1>Employee Management System</h1>
        <button onClick={() => setShowAddModal(true)}>Add Employee</button>
        <button onClick={() => setShowAdminModal(true)}>Add Admin</button>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </header>
      
      {/* Search Bar */}
      <input
        type="text"
        placeholder="Search employees..."
        value={searchTerm}
        onChange={handleSearch}
        className="search-bar"
      />

      {error && <p className="error-message">{error}</p>}

      {/* Employee Table */}
      <div className="employee-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>First Name</th>
              <th>Last Name</th>
              <th>Department ID</th>
              <th>Department Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredEmployees.map((employee) => (
              <tr key={employee.employee_id}>
                <td>{employee.employee_id}</td>
                <td>{employee.first_name}</td>
                <td>{employee.last_name}</td>
                <td>{employee.department_id}</td>
                <td>{employee.department_name || 'N/A'}</td> {/* Display department name */}
                <td>
                  <button onClick={() => openEditModal(employee)}>Edit</button>
                  <button onClick={() => handleDeleteEmployee(employee.employee_id)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Employee Modal */}
      <Modal isOpen={showAddModal} onRequestClose={() => setShowAddModal(false)} className="modal">
        <h2>Add Employee</h2>
        <EmployeeForm onSubmit={handleAddEmployee} onClose={() => setShowAddModal(false)} />
      </Modal>

      {/* Edit Employee Modal */}
      {currentEmployee && (
        <Modal isOpen={showEditModal} onRequestClose={() => setShowEditModal(false)} className="modal">
          <h2>Edit Employee</h2>
          <EmployeeForm
            onSubmit={handleEditEmployee}
            onClose={() => setShowEditModal(false)}
            employee={currentEmployee}
          />
        </Modal>
      )}

      {/* Add Admin Modal */}
      <Modal isOpen={showAdminModal} onRequestClose={() => setShowAdminModal(false)} className="modal">
        <h2>Add Admin Account</h2>
        <AdminForm onSubmit={handleAddAdmin} onClose={() => setShowAdminModal(false)} />
      </Modal>
    </div>
  );
}

// EmployeeForm Component for Add/Edit Form
function EmployeeForm({ onSubmit, onClose, employee }) {
  const [firstName, setFirstName] = useState(employee ? employee.first_name : '');
  const [lastName, setLastName] = useState(employee ? employee.last_name : '');
  const [departmentId, setDepartmentId] = useState(employee ? employee.department_id : '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ first_name: firstName, last_name: lastName, department_id: departmentId });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="employee-form">
      <div className="form-group">
        <label>First Name:</label>
        <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Last Name:</label>
        <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Department ID:</label>
        <input type="number" value={departmentId} onChange={(e) => setDepartmentId(e.target.value)} required />
      </div>
      <div className="button-group">
        <button type="submit">Submit</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

// AdminForm Component for Adding Admin Account
function AdminForm({ onSubmit, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ username, password });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="employee-form">
      <div className="form-group">
        <label>Username:</label>
        <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
      </div>
      <div className="form-group">
        <label>Password:</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
      </div>
      <div className="button-group">
        <button type="submit">Create Admin</button>
        <button type="button" onClick={onClose}>Cancel</button>
      </div>
    </form>
  );
}

export default EmployeePage;
