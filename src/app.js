const express = require('express');
const cors = require('cors');
const authRoutes = require('./modules/auth/auth.routes');
const complaintRoutes = require('./modules/complaint/complaint.route');
const AppError = require('./utils/AppError');
const globalErrorHandler = require('./middlewares/globalErrorHandler');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Base Health Check Route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'University Maintenance API is running'
  });
});
 
// Serve Frontend Static Files
const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'University Maintenance API is running'
  });
});
// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);

// Unhandled Routes (Express 5 compatible)
app.use((req, res, next) => {
  next(new AppError(`Cannot find ${req.originalUrl} on this server!`, 404));
});

// Global Error Handler
app.use(globalErrorHandler);

module.exports = app;
