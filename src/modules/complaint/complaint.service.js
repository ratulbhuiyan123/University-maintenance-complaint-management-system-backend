const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');

// ====================== STUDENT FEATURES ======================

const createComplaint = async (studentId, data) => {
  const { RoomID, CategoryID, Description, PhotoURL, Priority } = data;

  if (!RoomID || !CategoryID || !Description) {
    throw new AppError('RoomID, CategoryID, and Description are required.', 400);
  }

  // Check if Room exists
  const room = await prisma.room.findUnique({
    where: { RoomID: Number(RoomID) }
  });
  if (!room) {
    throw new AppError('Room not found with the provided RoomID.', 404);
  }

  // Check if Category exists
  const category = await prisma.category.findUnique({
    where: { CategoryID: Number(CategoryID) }
  });
  if (!category) {
    throw new AppError('Category not found with the provided CategoryID.', 404);
  }

  const priorityToSet = Priority || category.DefaultPriority || 'MEDIUM';

  const newComplaint = await prisma.complaint.create({
    data: {
      StudentID: studentId,
      RoomID: Number(RoomID),
      CategoryID: Number(CategoryID),
      Description,
      PhotoURL: PhotoURL || null,
      Priority: priorityToSet,
      Status: 'PENDING'
    },
    include: {
      category: true,
      room: {
        include: { building: true }
      }
    }
  });

  return newComplaint;
};

const getMyComplaints = async (studentId) => {
  const complaints = await prisma.complaint.findMany({
    where: { StudentID: studentId },
    include: {
      category: true,
      room: {
        include: { building: true }
      },
      assignedStaff: {
        select: {
          UserID: true,
          Name: true,
          Email: true,
          Phone: true
        }
      },
      statusLogs: {
        orderBy: { Timestamp: 'desc' }
      }
    },
    orderBy: { CreatedAt: 'desc' }
  });

  return complaints;
};

// ====================== ADMIN FEATURES ======================

const getAllComplaints = async (filters = {}) => {
  const where = {};

  if (filters.status) {
    where.Status = filters.status.toUpperCase();
  }

  if (filters.category) {
    if (!isNaN(filters.category)) {
      where.CategoryID = Number(filters.category);
    } else {
      where.category = {
        Name: filters.category
      };
    }
  }

  const complaints = await prisma.complaint.findMany({
    where,
    include: {
      student: {
        select: {
          UserID: true,
          Name: true,
          Email: true,
          Phone: true
        }
      },
      category: true,
      room: {
        include: { building: true }
      },
      assignedStaff: {
        select: {
          UserID: true,
          Name: true,
          Email: true,
          Phone: true
        }
      },
      statusLogs: {
        orderBy: { Timestamp: 'desc' }
      }
    },
    orderBy: { CreatedAt: 'desc' }
  });

  return complaints;
};

const assignComplaint = async (complaintId, adminId, data) => {
  const { assignedStaffId, priority, note } = data;

  if (!assignedStaffId) {
    throw new AppError('assignedStaffId is required.', 400);
  }

  // Check if complaint exists
  const complaint = await prisma.complaint.findUnique({
    where: { ComplaintID: Number(complaintId) }
  });
  if (!complaint) {
    throw new AppError('Complaint not found with the provided ID.', 404);
  }

  // Check if assigned staff exists and is STAFF
  const staff = await prisma.user.findUnique({
    where: { UserID: Number(assignedStaffId) }
  });
  if (!staff || staff.Role !== 'STAFF') {
    throw new AppError('Assigned user must exist and have the STAFF role.', 400);
  }

  const updateData = {
    AssignedStaffID: Number(assignedStaffId),
    Status: 'ASSIGNED'
  };

  if (priority) {
    updateData.Priority = priority.toUpperCase();
  }

  // Update complaint and create status log inside a transaction
  const updatedComplaint = await prisma.$transaction(async (tx) => {
    const updated = await tx.complaint.update({
      where: { ComplaintID: Number(complaintId) },
      data: updateData,
      include: {
        category: true,
        room: true,
        assignedStaff: {
          select: { UserID: true, Name: true, Email: true, Phone: true }
        }
      }
    });

    await tx.statusLog.create({
      data: {
        ComplaintID: Number(complaintId),
        UpdatedByUserID: adminId,
        Status: 'ASSIGNED',
        Note: note || `Complaint assigned to ${staff.Name} by Admin.`
      }
    });

    return updated;
  });

  return updatedComplaint;
};

// ====================== STAFF FEATURES ======================

const getStaffComplaints = async (staffId) => {
  const complaints = await prisma.complaint.findMany({
    where: {
      AssignedStaffID: staffId
    },
    include: {
      student: {
        select: {
          UserID: true,
          Name: true,
          Email: true,
          Phone: true
        }
      },
      category: true,
      room: {
        include: { building: true }
      },
      statusLogs: {
        orderBy: { Timestamp: 'desc' }
      }
    },
    orderBy: { CreatedAt: 'desc' }
  });

  return complaints;
};

const updateComplaintStatus = async (complaintId, staffId, data) => {
  const { status, Status, note, Note } = data;
  const statusToUpdate = (status || Status || '').toUpperCase();

  if (!statusToUpdate) {
    throw new AppError('Status is required.', 400);
  }

  const allowedStatuses = ['PENDING', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'];
  if (!allowedStatuses.includes(statusToUpdate)) {
    throw new AppError(`Invalid status. Allowed statuses are: ${allowedStatuses.join(', ')}`, 400);
  }

  // Check if complaint exists
  const complaint = await prisma.complaint.findUnique({
    where: { ComplaintID: Number(complaintId) }
  });

  if (!complaint) {
    throw new AppError('Complaint not found with the provided ID.', 404);
  }

  // Check if this complaint is assigned to this staff member
  if (complaint.AssignedStaffID !== staffId) {
    throw new AppError('You are not authorized to update this complaint as it is not assigned to you.', 403);
  }

  const updatePayload = {
    Status: statusToUpdate
  };

  if (statusToUpdate === 'RESOLVED') {
    updatePayload.ResolvedAt = new Date();
  }

  // Update complaint and create status log inside a transaction
  const updatedComplaint = await prisma.$transaction(async (tx) => {
    const updated = await tx.complaint.update({
      where: { ComplaintID: Number(complaintId) },
      data: updatePayload,
      include: {
        category: true,
        room: true,
        statusLogs: {
          orderBy: { Timestamp: 'desc' }
        }
      }
    });

    await tx.statusLog.create({
      data: {
        ComplaintID: Number(complaintId),
        UpdatedByUserID: staffId,
        Status: statusToUpdate,
        Note: note || Note || `Status updated to ${statusToUpdate} by maintenance staff.`
      }
    });

    return updated;
  });

  return updatedComplaint;
};

module.exports = {
  createComplaint,
  getMyComplaints,
  getAllComplaints,
  assignComplaint,
  getStaffComplaints,
  updateComplaintStatus
};
