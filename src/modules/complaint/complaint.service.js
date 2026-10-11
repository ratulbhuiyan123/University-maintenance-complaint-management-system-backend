const prisma = require('../../config/prisma');
const AppError = require('../../utils/AppError');

// ====================== METADATA (ROOMS & CATEGORIES) ======================

const ensureSeedData = async () => {
  try {
    const bCount = await prisma.building.count();
    const rCount = await prisma.room.count();

    if (bCount === 0 || rCount < 20) {
      const b1 = await prisma.building.upsert({
        where: { BuildingID: 1 },
        update: { Name: 'Main Academic Building (7 Floors)' },
        create: { BuildingID: 1, Name: 'Main Academic Building (7 Floors)' }
      });

      const b2 = await prisma.building.upsert({
        where: { BuildingID: 2 },
        update: { Name: 'Central Library & ICT Complex' },
        create: { BuildingID: 2, Name: 'Central Library & ICT Complex' }
      });

      const b3 = await prisma.building.upsert({
        where: { BuildingID: 3 },
        update: { Name: 'Student Activity & Sports Complex' },
        create: { BuildingID: 3, Name: 'Student Activity & Sports Complex' }
      });

      // 7 Floors × 10 rooms
      const floorNames = [
        { floor: 1, label: 'Ground Floor', names: ['Lecture Hall 1A', 'Physics Lab 1', 'Chemistry Lab', 'Student Affairs', 'Medical Center', 'Classroom 106', 'Seminar Room A', 'Security Control', 'Staff Dining', 'Maintenance Desk'] },
        { floor: 2, label: 'Level 2 (CSE)', names: ['Programming Lab 1', 'Programming Lab 2', 'Lecture Hall 2A', 'Circuit Lab', 'Faculty Room 2', 'Classroom 206', 'Classroom 207', 'NOC Center', 'Hardware Lab', 'Robotics Studio'] },
        { floor: 3, label: 'Level 3 (Software & AI)', names: ['Lecture Hall 3A', 'Classroom 302', 'Classroom 303', 'AI & ML Lab', 'Cyber Security Lab', 'Software Eng Lab', 'VR & Graphics Studio', 'CSE Head Office', 'CSE Lounge', 'Discussion Hall'] },
        { floor: 4, label: 'Level 4 (EEE)', names: ['Power Systems Lab', 'Microprocessor Lab', 'Lecture Hall 4A', 'Classroom 404', 'Classroom 405', 'DSP Lab', 'EEE Head Office', 'Telecom Lab', 'EEE Lounge', 'Graduate Lab'] },
        { floor: 5, label: 'Level 5 (Civil & Arch)', names: ['Materials Lab', 'Hydraulics Lab', 'Lecture Hall 5A', 'Classroom 504', 'Classroom 505', 'GIS Lab', 'Design Studio 1', 'Model Workshop', 'Civil Head Office', 'Civil Lounge'] },
        { floor: 6, label: 'Level 6 (Research & Dean)', names: ['Digital Library', 'Thesis Hall', 'Cloud Computing Lab', 'Classroom 604', 'Classroom 605', 'Big Data Center', 'Dean Office', 'Academic Council', 'Exam Office', 'Server Archive'] },
        { floor: 7, label: 'Level 7 (Executive & Auditorium)', names: ['Grand Auditorium', 'Conference Hall', 'Trustees Board Room', 'VC Secretariat', 'Pro-VC Office', 'Syndicate Room', 'VIP Protocol Wing', 'Media Briefing Room', 'AV Broadcast Room', 'Rooftop Terrace'] }
      ];

      for (const f of floorNames) {
        for (let i = 1; i <= 10; i++) {
          const roomId = f.floor * 100 + i;
          const roomTitle = `Room ${roomId} — ${f.names[i - 1]} (${f.label})`;
          await prisma.room.upsert({
            where: { RoomID: roomId },
            update: { BuildingID: b1.BuildingID, RoomNumber: roomTitle },
            create: { RoomID: roomId, BuildingID: b1.BuildingID, RoomNumber: roomTitle }
          }).catch(() => {});
        }
      }

      // Library rooms
      const libRooms = [
        { id: 801, num: 'Room 101-LIB — Main Circulation & Info Desk' },
        { id: 802, num: 'Room 201-LIB — Central Silent Reading Hall' },
        { id: 803, num: 'Room 301-LIB — E-Library & Digital Wing' },
        { id: 804, num: 'Room 401-LIB — Periodicals & Archive Wing' }
      ];
      for (const lr of libRooms) {
        await prisma.room.upsert({
          where: { RoomID: lr.id },
          update: { BuildingID: b2.BuildingID, RoomNumber: lr.num },
          create: { RoomID: lr.id, BuildingID: b2.BuildingID, RoomNumber: lr.num }
        }).catch(() => {});
      }

      // Sports & Activity rooms
      const sportsRooms = [
        { id: 901, num: 'Room 101-SAC — Indoor Sports Arena & Gymnasium' },
        { id: 902, num: 'Room 201-SAC — University Clubs Hub' },
        { id: 903, num: 'Room 301-SAC — Music & Arts Rehearsal Studio' }
      ];
      for (const sr of sportsRooms) {
        await prisma.room.upsert({
          where: { RoomID: sr.id },
          update: { BuildingID: b3.BuildingID, RoomNumber: sr.num },
          create: { RoomID: sr.id, BuildingID: b3.BuildingID, RoomNumber: sr.num }
        }).catch(() => {});
      }
    }

    const cCount = await prisma.category.count();
    if (cCount < 10) {
      const defaultCategories = [
        { Name: 'Electrical (Lights, Fans, Switches, Wiring)', DefaultPriority: 'HIGH' },
        { Name: 'HVAC & Air Conditioning (Cooling, Leakage, Filters)', DefaultPriority: 'HIGH' },
        { Name: 'IT & Network (Wi-Fi, LAN, Routers, Speed)', DefaultPriority: 'URGENT' },
        { Name: 'Multimedia & AV (Projectors, Smartboards, Sound, Mics)', DefaultPriority: 'HIGH' },
        { Name: 'Plumbing & Water (Washroom, Taps, Leakage, Drainage)', DefaultPriority: 'MEDIUM' },
        { Name: 'Drinking Water & Purifiers (Coolers, Filters, Dispensers)', DefaultPriority: 'HIGH' },
        { Name: 'Carpentry & Furniture (Desks, Benches, Chairs, Podiums)', DefaultPriority: 'LOW' },
        { Name: 'Civil & Structural (Doors, Locks, Windows, Glass, Walls)', DefaultPriority: 'MEDIUM' },
        { Name: 'Elevator & Lift Maintenance', DefaultPriority: 'URGENT' },
        { Name: 'Security & Surveillance (CCTV, Access Card, Gates)', DefaultPriority: 'HIGH' },
        { Name: 'Fire & Safety Systems (Extinguishers, Alarms, Emergency Lights)', DefaultPriority: 'URGENT' },
        { Name: 'Housekeeping & Sanitation (Deep Cleaning, Pest Control, Waste)', DefaultPriority: 'LOW' },
        { Name: 'Power Backup & Generator (UPS, Generator, Voltage Stabilizer)', DefaultPriority: 'URGENT' }
      ];
      for (const cat of defaultCategories) {
        await prisma.category.upsert({
          where: { Name: cat.Name },
          update: { DefaultPriority: cat.DefaultPriority },
          create: cat
        }).catch(() => {});
      }
    }
  } catch (err) {
    console.error('Seed verification notice:', err.message);
  }
};

const getMetadata = async () => {
  await ensureSeedData();

  let buildings = await prisma.building.findMany({
    include: {
      rooms: {
        orderBy: { RoomNumber: 'asc' }
      }
    },
    orderBy: { Name: 'asc' }
  });

  let categories = await prisma.category.findMany({
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
  await ensureSeedData();

  const items = data.items || data.locations;

  // Multi-location batch submission (CP-2 feature)
  if (Array.isArray(items) && items.length > 0) {
    const createdComplaints = [];

    // Pre-validate all items
    for (const [index, item] of items.entries()) {
      let roomId = Number(item.roomId || item.RoomID);
      const catIds = item.categoryIds || item.categories || (item.CategoryID ? [item.CategoryID] : []);

      if (!roomId) {
        // Fallback to first available room if not specified
        const firstRoom = await prisma.room.findFirst();
        if (firstRoom) roomId = firstRoom.RoomID;
        else throw new AppError(`Location #${index + 1}: Room selection is required.`, 400);
      }

      if (!Array.isArray(catIds) || catIds.length === 0) {
        throw new AppError(`Location #${index + 1}: At least one category must be selected.`, 400);
      }

      let room = await prisma.room.findUnique({ where: { RoomID: roomId } });
      if (!room) {
        // Fallback to first available room if ID does not exist in DB
        const fallbackRoom = await prisma.room.findFirst();
        if (fallbackRoom) {
          roomId = fallbackRoom.RoomID;
          item.roomId = fallbackRoom.RoomID;
        } else {
          throw new AppError(`Location #${index + 1}: Room ID ${roomId} does not exist.`, 404);
        }
      }
    }

    // Process all complaints in a transaction
    await prisma.$transaction(async (tx) => {
      for (const item of items) {
        let roomId = Number(item.roomId || item.RoomID);
        const catIds = item.categoryIds || item.categories || (item.CategoryID ? [item.CategoryID] : []);
        const priority = item.priority || item.Priority || 'MEDIUM';
        const itemDesc = item.description || item.Description || data.generalDescription || data.Description || 'No description provided';
        const photoUrl = item.photoUrl || item.PhotoURL || data.photoUrl || data.PhotoURL || null;

        for (const catId of catIds) {
          let category = await tx.category.findUnique({
            where: { CategoryID: Number(catId) }
          });
          if (!category) {
            category = await tx.category.findFirst();
            if (!category) {
              throw new AppError(`Category ID ${catId} not found.`, 404);
            }
          }

          const created = await tx.complaint.create({
            data: {
              StudentID: studentId,
              RoomID: roomId,
              CategoryID: category.CategoryID,
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
  let RoomID = Number(data.RoomID || data.roomId || (data.rooms && data.rooms[0]));
  let CategoryID = Number(data.CategoryID || data.categoryId || (data.categories && data.categories[0]));
  const Description = data.Description || data.description || data.generalDescription;
  const PhotoURL = data.PhotoURL || data.photoUrl || data.photo || null;
  const Priority = data.Priority || data.priority;

  if (!Description) {
    throw new AppError('Description is required.', 400);
  }

  if (!RoomID) {
    const firstRoom = await prisma.room.findFirst();
    if (firstRoom) RoomID = firstRoom.RoomID;
    else throw new AppError('Room selection is required.', 400);
  }

  let room = await prisma.room.findUnique({
    where: { RoomID: RoomID }
  });
  if (!room) {
    const fallbackRoom = await prisma.room.findFirst();
    if (fallbackRoom) RoomID = fallbackRoom.RoomID;
    else throw new AppError('Room not found.', 404);
  }

  if (!CategoryID) {
    const firstCat = await prisma.category.findFirst();
    if (firstCat) CategoryID = firstCat.CategoryID;
    else throw new AppError('Category selection is required.', 400);
  }

  let category = await prisma.category.findUnique({
    where: { CategoryID: CategoryID }
  });
  if (!category) {
    const fallbackCat = await prisma.category.findFirst();
    if (fallbackCat) CategoryID = fallbackCat.CategoryID;
    else throw new AppError('Category not found.', 404);
  }

  const priorityToSet = (Priority || category.DefaultPriority || 'MEDIUM').toUpperCase();

  const newComplaint = await prisma.complaint.create({
    data: {
      StudentID: studentId,
      RoomID: RoomID,
      CategoryID: CategoryID,
      Description,
      PhotoURL: PhotoURL,
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
