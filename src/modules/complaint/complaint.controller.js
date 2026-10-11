const complaintService = require('./complaint.service');

// ====================== METADATA ======================
const getMetadata = async (req, res, next) => {
  try {
    const data = await complaintService.getMetadata();
    res.status(200).json({
      status: 'success',
      data
    });
  } catch (error) {
    next(error);
  }
};

// ====================== STUDENT CONTROLLER ======================
const createComplaint = async (req, res, next) => {
  try {
    const studentId = req.user.UserID;
    const result = await complaintService.createComplaint(studentId, req.body);

    res.status(201).json({
      status: 'success',
      data: result.complaints ? result : { complaint: result }
    });
  } catch (error) {
    next(error);
  }
};

const getMyComplaints = async (req, res, next) => {
  try {
    const studentId = req.user.UserID;
    const complaints = await complaintService.getMyComplaints(studentId);

    res.status(200).json({
      status: 'success',
      results: complaints.length,
      data: { complaints }
    });
  } catch (error) {
    next(error);
  }
};

const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await complaintService.getComplaintById(req.params.id, req.user);
    res.status(200).json({
      status: 'success',
      data: { complaint }
    });
  } catch (error) {
    next(error);
  }
};

const updateComplaint = async (req, res, next) => {
  try {
    const updated = await complaintService.updateComplaint(req.params.id, req.user, req.body);
    res.status(200).json({
      status: 'success',
      message: 'Complaint updated successfully.',
      data: { complaint: updated }
    });
  } catch (error) {
    next(error);
  }
};

const deleteComplaint = async (req, res, next) => {
  try {
    const result = await complaintService.deleteComplaint(req.params.id, req.user);
    res.status(200).json({
      status: 'success',
      message: result.message
    });
  } catch (error) {
    next(error);
  }
};

// ====================== ADMIN CONTROLLER ======================
const getAllComplaints = async (req, res, next) => {
  try {
    const complaints = await complaintService.getAllComplaints(req.query);
    res.status(200).json({
      status: 'success',
      results: complaints.length,
      data: { complaints }
    });
  } catch (error) {
    next(error);
  }
};

const assignComplaint = async (req, res, next) => {
  try {
    const { id } = req.params;
    const adminId = req.user.UserID;
    const { assignedStaffId, AssignedStaffID, priority, Priority, note } = req.body;

    const updatedComplaint = await complaintService.assignComplaint(id, adminId, {
      assignedStaffId: assignedStaffId || AssignedStaffID,
      priority: priority || Priority,
      note
    });

    res.status(200).json({
      status: 'success',
      data: { complaint: updatedComplaint }
    });
  } catch (error) {
    next(error);
  }
};

// ====================== STAFF CONTROLLER ======================
const getStaffComplaints = async (req, res, next) => {
  try {
    const staffId = req.user.UserID;
    const complaints = await complaintService.getStaffComplaints(staffId);
    res.status(200).json({
      status: 'success',
      results: complaints.length,
      data: { complaints }
    });
  } catch (error) {
    next(error);
  }
};

const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const staffId = req.user.UserID;
    const updatedComplaint = await complaintService.updateComplaintStatus(id, staffId, req.body);
    res.status(200).json({
      status: 'success',
      data: { complaint: updatedComplaint }
    });
  } catch (error) {
    next(error);
  }
};

// ====================== UNIFIED COMPLAINTS HANDLER ======================
const getComplaints = async (req, res, next) => {
  try {
    const role = (req.user.Role || '').toUpperCase();
    let complaints;
    if (role === 'ADMIN') {
      complaints = await complaintService.getAllComplaints(req.query);
    } else if (role === 'STAFF') {
      complaints = await complaintService.getStaffComplaints(req.user.UserID);
    } else {
      complaints = await complaintService.getMyComplaints(req.user.UserID);
    }
    res.status(200).json({
      status: 'success',
      results: complaints.length,
      data: { complaints }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMetadata,
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getAllComplaints,
  assignComplaint,
  getStaffComplaints,
  updateComplaintStatus,
  getComplaints
};
