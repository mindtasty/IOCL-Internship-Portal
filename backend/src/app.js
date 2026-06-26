// app.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();

// Middlewares
const allowedOrigins = [
  "http://localhost:5173",
  "https:\\iocl-internship-portal.vercel.app"
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (e.g. Postman, server-to-server)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static uploaded files
app.use('/uploads', express.static(uploadsDir));

// Welcome route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Internship Management Portal API' });
});

// Import routers (Placeholders for now)
const authRoutes = require('./routes/auth');
const applicationRoutes = require('./routes/applications');
const attendanceRoutes = require('./routes/attendance');
const mentorRoutes = require('./routes/mentors');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');
const notificationRoutes = require('./routes/notifications');

// Bind routers
app.use('/api/auth', authRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/mentors', mentorRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/notifications', notificationRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;
