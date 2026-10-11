const express = require('express');
const complaintController = require('./complaint.controller');
const { protect, restrictTo } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Public Metadata Route (Rooms & Categories)
router.get('/meta', complaintController.getMetadata);

// All complaint actions below require authentication
router.use(protect);

// Unified complaints endpoint (auto-filtered by role)
router.get(['/', '/complaints'], complaintController.getComplaints);

// Report maintenance issue (Accessible to STUDENTS, ADMINS, & STAFF)
router.post(['/', '/complaints'], complaintController.createComplaint);

// Student Complaints
router.get(['/my-complaints', '/complaints/my-complaints'], complaintController.getMyComplaints);

// ====================== ADMIN ROUTES ======================
router.get(['/admin', '/admin/complaints'], restrictTo('ADMIN'), complaintController.getAllComplaints);
router.put(['/admin/:id/assign', '/admin/complaints/:id/assign'], restrictTo('ADMIN'), complaintController.assignComplaint);

// ====================== STAFF ROUTES ======================
router.get(['/staff', '/staff/complaints'], restrictTo('STAFF'), complaintController.getStaffComplaints);
router.put(['/staff/:id/status', '/staff/complaints/:id/status'], restrictTo('STAFF'), complaintController.updateComplaintStatus);

// ====================== SINGLE COMPLAINT CRUD ======================
router.route('/:id')
  .get(complaintController.getComplaintById)
  .put(complaintController.updateComplaint)
  .delete(complaintController.deleteComplaint);

module.exports = router;
