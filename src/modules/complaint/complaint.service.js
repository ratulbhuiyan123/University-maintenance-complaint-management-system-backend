const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');

// ====================== METADATA (ROOMS & CATEGORIES) ======================

const getMetadata = async () => {
  const buildings = await prisma.building.findMany({
    include: {
      rooms: {
        orderBy: { RoomNumber: 'asc' }
      }
    },
    orderBy: { Name: 'asc' }
  });

  const categories = await prisma.category.findMany({
    orderBy: { CategoryID: 'asc' }
  });

  return { buildings, categories };
};

// ====================== STUDENT FEATURES & MULTI-LOCATION ======================

/**
 * Creates one or multiple complaints.
 * Supports:
 * 1. Single entry: { RoomID, CategoryID, Description, Priority, PhotoURL }
 * 2. Multi-location CP-2 entry: { items: [ { roomId, categoryIds: [...], priority, description } ], photoUrl, generalDescription }
 */
const createComplaint = async (studentId, data) => {
  const items = data.items || data.locations;

  // Multi-location batch submission (CP-2 feature)
  if (Array.isArray(items) && items.length > 0) {
    const createdComplaints = [];

    // Pre-validate all items
    for (const [index, item] of items.entries()) {
      const roomId = Number(item.roomId || item.RoomID);
      const catIds = item.categoryIds || item.categories || (item.CategoryID ? [item.CategoryID] : []);

      if (!roomId) {
        throw new AppError(`Location #${index + 1}: Room selection is required.`, 400);
      }
      if (!Array.isArray(catIds) || catIds.length === 0) {
        throw new AppError(`Location #${index + 1}: At least one category must be selected.`, 400);
      }

      const room = await prisma.room.findUnique({ where: { RoomID: roomId } });
      if (!room) {
        throw new AppError(`Location #${index + 1}: Room ID ${roomId} does not exist.`, 404);
      }
    }

    // Process all complaints in a transaction
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const roomId = Number(item.roomId || item.RoomID);
        const catIds = item.categoryIds || item.categories || (item.CategoryID ? [item.CategoryID] : []);
        const priority = item.priority || item.Priority || 'MEDIUM';
        const itemDesc = item.description || item.Description || data.generalDescription || data.Description || 'No description provided';
        const photoUrl = item.photoUrl || item.PhotoURL || data.photoUrl || data.PhotoURL || null;

        for (const catId of catIds) {
          const category = await tx.category.findUnique({
            where: { CategoryID: Number(catId) }
          });
          if (!category) {
            throw new AppError(`Category ID ${catId} not found.`, 404);
          }

          const created = await tx.complaint.create({
            data: {
              StudentID: studentId,
              RoomID: roomId,
              CategoryID: Number(catId),
              Description: itemDesc,
              PhotoURL: photoUrl,
              Priority: priority.toUpperCase(),
              Status: 'PENDING'
            },
            include: {
              category: true,
              room: { include: { building: true } }
            }
          });

          createdComplaints.push(created);
        }
      }
    });

    return {
      message: `Successfully created ${createdComplaints.length} complaint report(s) across ${items.length} location(s).`,
      count: createdComplaints.length,
      complaints: createdComplaints
    };
  }

  // Single complaint backward compatibility
  const { RoomID, CategoryID, Description, PhotoURL, Priority } = data;

  if (!RoomID || !CategoryID || !Description) {
    throw new AppError('RoomID, CategoryID, and Description are required.', 400);
  }

  const room = await prisma.room.findUnique({
    where: { RoomID: Number(RoomID) }
  });
  if (!room) {
    throw new AppError('Room not found with the provided RoomID.', 404);
  }

  const category = await prisma.category.findUnique({
    where: { CategoryID: Number(CategoryID) }
  });
  if (!category) {
    throw new AppError('Category not found with the provided CategoryID.', 404);
  }

  const priorityToSet = (Priority || category.DefaultPriority || 'MEDIUM').toUpperCase();

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
      room: { include: { building: true } }
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

const getComplaintById = async (complaintId, user) => {
  const complaint = await prisma.complaint.findUnique({
    where: { ComplaintID: Number(complaintId) },
    include: {
      student: {
        select: { UserID: true, Name: true, Email: true, Phone: true }
      },
      category: true,
      room: { include: { building: true } },
      assignedStaff: {
        select: { UserID: true, Name: true, Email: true, Phone: true }
      },
      statusLogs: {
        orderBy: { Timestamp: 'desc' }
      }
    }
  });

  if (!complaint) {
    throw new AppError('Complaint not found.', 404);
  }

  if (user.Role === 'STUDENT' && complaint.StudentID !== user.UserID) {
    throw new AppError('You do not have permission to view this complaint.', 403);
  }

  return complaint;
};

// ====================== CRUD: UPDATE & DELETE ======================

const updateComplaint = async (complaintId, user, data) => {
  const complaint = await prisma.complaint.findUnique({
    where: { ComplaintID: Number(complaintId) }
  });

  if (!complaint) {
    throw new AppError('Complaint not found.', 404);
  }

  if (user.Role === 'STUDENT') {
    if (complaint.StudentID !== user.UserID) {
      throw new AppError('You can only edit your own complaints.', 403);
    }
    if (complaint.Status !== 'PENDING') {
      throw new AppError('Cannot edit complaint after it has been reviewed or assigned.', 400);
    }
  }

  const updateData = {};
  if (data.Description || data.description) updateData.Description = data.Description || data.description;
  if (data.Priority || data.priority) updateData.Priority = (data.Priority || data.priority).toUpperCase();
  if (data.RoomID || data.roomId) updateData.RoomID = Number(data.RoomID || data.roomId);
  if (data.CategoryID || data.categoryId) updateData.CategoryID = Number(data.CategoryID || data.categoryId);
  if (data.PhotoURL !== undefined || data.photoUrl !== undefined) {
    updateData.PhotoURL = data.PhotoURL || data.photoUrl || null;
  }

  const updated = await prisma.complaint.update({
    where: { ComplaintID: Number(complaintId) },
    data: updateData,
    include: {
      category: true,
      room: { include: { building: true } }
    }
  });

  return updated;
};

const deleteComplaint = async (complaintId, user) => {
  const complaint = await prisma.complaint.findUnique({
    where: { ComplaintID: Number(complaintId) }
  });

  if (!complaint) {
    throw new AppError('Complaint not found.', 404);
  }

  if (user.Role === 'STUDENT') {
    if (complaint.StudentID !== user.UserID) {
      throw new AppError('You can only delete your own complaints.', 403);
    }
    if (complaint.Status !== 'PENDING') {
      throw new AppError('Cannot delete a complaint that is already being processed.', 400);
    }
  }

  await prisma.complaint.delete({
    where: { ComplaintID: Number(complaintId) }
  });

  return { message: 'Complaint deleted successfully.' };
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
      where.category = { Name: filters.category };
    }
  }

  const complaints = await prisma.complaint.findMany({
    where,
    include: {
      student: {
        select: { UserID: true, Name: true, Email: true, Phone: true }
      },
      category: true,
      room: { include: { building: true } },
      assignedStaff: {
        select: { UserID: true, Name: true, Email: true, Phone: true }
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

  const complaint = await prisma.complaint.findUnique({
    where: { ComplaintID: Number(complaintId) }
  });
  if (!complaint) {
    throw new AppError('Complaint not found with the provided ID.', 404);
  }

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
    where: { AssignedStaffID: staffId },
    include: {
      student: {
        select: { UserID: true, Name: true, Email: true, Phone: true }
      },
      category: true,
      room: { include: { building: true } },
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

  const complaint = await prisma.complaint.findUnique({
    where: { ComplaintID: Number(complaintId) }
  });

  if (!complaint) {
    throw new AppError('Complaint not found with the provided ID.', 404);
  }

  if (complaint.AssignedStaffID !== staffId) {
    throw new AppError('You are not authorized to update this complaint as it is not assigned to you.', 403);
  }

  const updatePayload = { Status: statusToUpdate };
  if (statusToUpdate === 'RESOLVED') {
    updatePayload.ResolvedAt = new Date();
  }

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
  getMetadata,
  createComplaint,
  getMyComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getAllComplaints,
  assignComplaint,
  getStaffComplaints,
  updateComplaintStatus
};
