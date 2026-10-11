const express = require('express');
const complaintController = require('./complaint.controller');
const { protect, restrictTo } = require('../../middlewares/auth.middleware');

const router = express.Router();

// Public / Protected Metadata Route
router.get('/meta', protect, complaintController.getMetadata);

// All complaint actions require authentication
router.use(protect);

// ====================== STUDENT ROUTES ======================
router.post(['/', '/complaints'], restrictTo('STUDENT'), complaintController.createComplaint);
router.get(['/my-complaints', '/complaints/my-complaints'], restrictTo('STUDENT'), complaintController.getMyComplaints);

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
