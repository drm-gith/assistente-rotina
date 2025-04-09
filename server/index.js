const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
app.use(cors());
app.use(express.json());

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Authentication middleware
const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Login route
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body;
  
  try {
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const user = users[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );
    
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get patients
app.get('/api/patients', authenticate, async (req, res) => {
  try {
    const [patients] = await pool.query('SELECT * FROM patients');
    res.json(patients);
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create patient
app.post('/api/patients', authenticate, async (req, res) => {
  const { name, diagnosis, sector, notes, clm, destination, labs, prescription, examsPending, exams } = req.body;
  
  try {
    const [result] = await pool.query(
      `INSERT INTO patients (name, diagnosis, sector, notes, clm, destination, 
                            labs, prescription, examsPending, exams) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, diagnosis, sector, notes, clm, destination, labs, prescription, examsPending, JSON.stringify(exams)]
    );
    
    res.status(201).json({ id: result.insertId });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update patient
app.put('/api/patients/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { name, diagnosis, sector, notes, clm, destination, labs, prescription, examsPending, exams } = req.body;
  
  try {
    await pool.query(
      `UPDATE patients 
       SET name = ?, diagnosis = ?, sector = ?, notes = ?, 
           clm = ?, destination = ?, labs = ?, prescription = ?, 
           examsPending = ?, exams = ?
       WHERE id = ?`,
      [name, diagnosis, sector, notes, clm, destination, labs, prescription, examsPending, JSON.stringify(exams), id]
    );
    
    res.json({ message: 'Patient updated' });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete patient
app.delete('/api/patients/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  
  try {
    await pool.query('DELETE FROM patients WHERE id = ?', [id]);
    res.json({ message: 'Patient deleted' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));