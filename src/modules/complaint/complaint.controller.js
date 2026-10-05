const complaintService = require('./complaint.service');

// ====================== STUDENT CONTROLLER ======================

const createComplaint = async (req, res, next) => {
  try {
    const studentId = req.user.UserID;
    const complaint = await complaintService.createComplaint(studentId, req.body);

    res.status(201).json({
      status: 'success',
      data: {
        complaint
      }
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
      data: {
        complaints
      }
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
      data: {
        complaints
      }
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
      data: {
        complaint: updatedComplaint
      }
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
      data: {
        complaints
      }
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
      data: {
        complaint: updatedComplaint
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  assignComplaint,
  getStaffComplaints,
  updateComplaintStatus
};
