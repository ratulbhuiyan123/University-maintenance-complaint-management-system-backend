const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting Comprehensive University Database Seeding...');

  // 1. CREATE BUILDINGS
  const mainAcademic = await prisma.building.upsert({
    where: { BuildingID: 1 },
    update: { Name: 'Main Academic Building (7 Floors)' },
    create: {
      BuildingID: 1,
      Name: 'Main Academic Building (7 Floors)'
    }
  });

  const libraryBuilding = await prisma.building.upsert({
    where: { BuildingID: 2 },
    update: { Name: 'Central Library & ICT Complex' },
    create: {
      BuildingID: 2,
      Name: 'Central Library & ICT Complex'
    }
  });

  const studentComplex = await prisma.building.upsert({
    where: { BuildingID: 3 },
    update: { Name: 'Student Activity & Sports Complex' },
    create: {
      BuildingID: 3,
      Name: 'Student Activity & Sports Complex'
    }
  });

  // 2. CREATE 70+ REALISTIC ROOMS (7 FLOORS × 10 ROOMS + OTHER WINGS)
  const roomData = [
    // FLOOR 1 (Ground Floor - 100 series)
    { id: 101, bId: mainAcademic.BuildingID, num: 'Room 101 — Lecture Hall 1A (Ground Floor)' },
    { id: 102, bId: mainAcademic.BuildingID, num: 'Room 102 — Physics Lab 1' },
    { id: 103, bId: mainAcademic.BuildingID, num: 'Room 103 — Chemistry & Material Science Lab' },
    { id: 104, bId: mainAcademic.BuildingID, num: 'Room 104 — Student Affairs & Admissions Office' },
    { id: 105, bId: mainAcademic.BuildingID, num: 'Room 105 — Medical & First Aid Center' },
    { id: 106, bId: mainAcademic.BuildingID, num: 'Room 106 — General Classroom 106' },
    { id: 107, bId: mainAcademic.BuildingID, num: 'Room 107 — Seminar Room A' },
    { id: 108, bId: mainAcademic.BuildingID, num: 'Room 108 — Campus Security & Control Room' },
    { id: 109, bId: mainAcademic.BuildingID, num: 'Room 109 — Faculty & Staff Dining Room' },
    { id: 110, bId: mainAcademic.BuildingID, num: 'Room 110 — Facility & Maintenance Desk' },

    // FLOOR 2 (200 series)
    { id: 201, bId: mainAcademic.BuildingID, num: 'Room 201 — Computer Programming Lab 1' },
    { id: 202, bId: mainAcademic.BuildingID, num: 'Room 202 — Computer Programming Lab 2' },
    { id: 203, bId: mainAcademic.BuildingID, num: 'Room 203 — Lecture Hall 2A' },
    { id: 204, bId: mainAcademic.BuildingID, num: 'Room 204 — Electronics & Circuits Lab' },
    { id: 205, bId: mainAcademic.BuildingID, num: 'Room 205 — Faculty Conference Room 2' },
    { id: 206, bId: mainAcademic.BuildingID, num: 'Room 206 — General Classroom 206' },
    { id: 207, bId: mainAcademic.BuildingID, num: 'Room 207 — General Classroom 207' },
    { id: 208, bId: mainAcademic.BuildingID, num: 'Room 208 — Network Operations Center (NOC)' },
    { id: 209, bId: mainAcademic.BuildingID, num: 'Room 209 — Computer Hardware Lab' },
    { id: 210, bId: mainAcademic.BuildingID, num: 'Room 210 — Robotics & Embedded Systems Studio' },

    // FLOOR 3 (300 series)
    { id: 301, bId: mainAcademic.BuildingID, num: 'Room 301 — Lecture Hall 3A' },
    { id: 302, bId: mainAcademic.BuildingID, num: 'Room 302 — General Classroom 302' },
    { id: 303, bId: mainAcademic.BuildingID, num: 'Room 303 — General Classroom 303' },
    { id: 304, bId: mainAcademic.BuildingID, num: 'Room 304 — AI & Machine Learning Research Lab' },
    { id: 305, bId: mainAcademic.BuildingID, num: 'Room 305 — Cyber Security & Forensics Lab' },
    { id: 306, bId: mainAcademic.BuildingID, num: 'Room 306 — Software Engineering Lab' },
    { id: 307, bId: mainAcademic.BuildingID, num: 'Room 307 — Multimedia & Virtual Reality Studio' },
    { id: 308, bId: mainAcademic.BuildingID, num: 'Room 308 — CSE Department Head Office' },
    { id: 309, bId: mainAcademic.BuildingID, num: 'Room 309 — CSE Faculty Lounge' },
    { id: 310, bId: mainAcademic.BuildingID, num: 'Room 310 — Student Project Discussion Hall' },

    // FLOOR 4 (400 series)
    { id: 401, bId: mainAcademic.BuildingID, num: 'Room 401 — Power Systems & Electrical Machines Lab' },
    { id: 402, bId: mainAcademic.BuildingID, num: 'Room 402 — Microprocessor & Control Lab' },
    { id: 403, bId: mainAcademic.BuildingID, num: 'Room 403 — Lecture Hall 4A' },
    { id: 404, bId: mainAcademic.BuildingID, num: 'Room 404 — General Classroom 404' },
    { id: 405, bId: mainAcademic.BuildingID, num: 'Room 405 — General Classroom 405' },
    { id: 406, bId: mainAcademic.BuildingID, num: 'Room 406 — Digital Signal Processing Lab' },
    { id: 407, bId: mainAcademic.BuildingID, num: 'Room 407 — EEE Department Head Office' },
    { id: 408, bId: mainAcademic.BuildingID, num: 'Room 408 — Telecommunications & Antenna Lab' },
    { id: 409, bId: mainAcademic.BuildingID, num: 'Room 409 — EEE Faculty Lounge' },
    { id: 410, bId: mainAcademic.BuildingID, num: 'Room 410 — Post-Graduate Research Lab' },

    // FLOOR 5 (500 series)
    { id: 501, bId: mainAcademic.BuildingID, num: 'Room 501 — Structural Materials Testing Lab' },
    { id: 502, bId: mainAcademic.BuildingID, num: 'Room 502 — Fluid Mechanics & Hydraulics Lab' },
    { id: 503, bId: mainAcademic.BuildingID, num: 'Room 503 — Lecture Hall 5A' },
    { id: 504, bId: mainAcademic.BuildingID, num: 'Room 504 — General Classroom 504' },
    { id: 505, bId: mainAcademic.BuildingID, num: 'Room 505 — General Classroom 505' },
    { id: 506, bId: mainAcademic.BuildingID, num: 'Room 506 — Surveying & GIS Mapping Center' },
    { id: 507, bId: mainAcademic.BuildingID, num: 'Room 507 — Architecture Drafting Studio 1' },
    { id: 508, bId: mainAcademic.BuildingID, num: 'Room 508 — Model Making & Wood Workshop' },
    { id: 509, bId: mainAcademic.BuildingID, num: 'Room 509 — Civil Engineering Head Office' },
    { id: 510, bId: mainAcademic.BuildingID, num: 'Room 510 — Civil Faculty Lounge' },

    // FLOOR 6 (600 series)
    { id: 601, bId: mainAcademic.BuildingID, num: 'Room 601 — Digital Research Library' },
    { id: 602, bId: mainAcademic.BuildingID, num: 'Room 602 — Thesis Defense Hall' },
    { id: 603, bId: mainAcademic.BuildingID, num: 'Room 603 — Cloud Computing Research Center' },
    { id: 604, bId: mainAcademic.BuildingID, num: 'Room 604 — General Classroom 604' },
    { id: 605, bId: mainAcademic.BuildingID, num: 'Room 605 — General Classroom 605' },
    { id: 606, bId: mainAcademic.BuildingID, num: 'Room 606 — Big Data Analytics Center' },
    { id: 607, bId: mainAcademic.BuildingID, num: 'Room 607 — Dean of Engineering Office' },
    { id: 608, bId: mainAcademic.BuildingID, num: 'Room 608 — Academic Council Conference Room' },
    { id: 609, bId: mainAcademic.BuildingID, num: 'Room 609 — Examination Controller Secretariat' },
    { id: 610, bId: mainAcademic.BuildingID, num: 'Room 610 — Server & Central Backup Archive' },

    // FLOOR 7 (700 series)
    { id: 701, bId: mainAcademic.BuildingID, num: 'Room 701 — University Grand Auditorium' },
    { id: 702, bId: mainAcademic.BuildingID, num: 'Room 702 — International Conference Hall' },
    { id: 703, bId: mainAcademic.BuildingID, num: 'Room 703 — Board of Trustees Meeting Room' },
    { id: 704, bId: mainAcademic.BuildingID, num: 'Room 704 — Vice Chancellor (VC) Secretariat' },
    { id: 705, bId: mainAcademic.BuildingID, num: 'Room 705 — Pro-Vice Chancellor Office' },
    { id: 706, bId: mainAcademic.BuildingID, num: 'Room 706 — University Syndicate Meeting Room' },
    { id: 707, bId: mainAcademic.BuildingID, num: 'Room 707 — VIP Guest Lounge & Protocol Wing' },
    { id: 708, bId: mainAcademic.BuildingID, num: 'Room 708 — Press & Media Briefing Room' },
    { id: 709, bId: mainAcademic.BuildingID, num: 'Room 709 — Audio-Visual & Broadcast Control' },
    { id: 710, bId: mainAcademic.BuildingID, num: 'Room 710 — Rooftop Green Terrace & Banquet Lounge' },

    // Central Library Rooms
    { id: 801, bId: libraryBuilding.BuildingID, num: 'Room 101-LIB — Main Circulation & Information Desk' },
    { id: 802, bId: libraryBuilding.BuildingID, num: 'Room 201-LIB — Central Silent Reading Hall' },
    { id: 803, bId: libraryBuilding.BuildingID, num: 'Room 301-LIB — E-Library & Digital Resource Wing' },
    { id: 804, bId: libraryBuilding.BuildingID, num: 'Room 401-LIB — Periodicals, Journal & Archive Wing' },

    // Student Activity Complex
    { id: 901, bId: studentComplex.BuildingID, num: 'Room 101-SAC — Indoor Sports Arena & Gymnasium' },
    { id: 902, bId: studentComplex.BuildingID, num: 'Room 201-SAC — University Clubs & Societies Hub' },
    { id: 903, bId: studentComplex.BuildingID, num: 'Room 301-SAC — Performing Arts & Music Rehearsal Studio' }
  ];

  console.log(`Seeding ${roomData.length} campus rooms...`);
  for (const r of roomData) {
    await prisma.room.upsert({
      where: { RoomID: r.id },
      update: {
        BuildingID: r.bId,
        RoomNumber: r.num
      },
      create: {
        RoomID: r.id,
        BuildingID: r.bId,
        RoomNumber: r.num
      }
    });
  }

  // 3. CREATE EXTENSIVE REALISTIC MAINTENANCE CATEGORIES
  const categories = [
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

  console.log(`Seeding ${categories.length} maintenance categories...`);
  for (const cat of categories) {
    await prisma.category.upsert({
      where: { Name: cat.Name },
      update: { DefaultPriority: cat.DefaultPriority },
      create: cat
    });
  }

  // 4. CREATE DEFAULT USERS
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Admin
  const adminUser = await prisma.user.upsert({
    where: { Email: 'admin@campus.edu' },
    update: { Password: hashedPassword },
    create: {
      Name: 'Campus Facility Director',
      Email: 'admin@campus.edu',
      Password: hashedPassword,
      Role: 'ADMIN',
      Phone: '01700000001'
    }
  });

  // Staff Technicians
  const staffKarim = await prisma.user.upsert({
    where: { Email: 'staff@campus.edu' },
    update: { Password: hashedPassword },
    create: {
      Name: 'Karim (Head of Campus Maintenance)',
      Email: 'staff@campus.edu',
      Password: hashedPassword,
      Role: 'STAFF',
      Phone: '01700000002'
    }
  });

  const staffRafiq = await prisma.user.upsert({
    where: { Email: 'electrician@campus.edu' },
    update: { Password: hashedPassword },
    create: {
      Name: 'Rafiq (Senior Electrical Technician)',
      Email: 'electrician@campus.edu',
      Password: hashedPassword,
      Role: 'STAFF',
      Phone: '01700000004'
    }
  });

  const staffSalam = await prisma.user.upsert({
    where: { Email: 'plumber@campus.edu' },
    update: { Password: hashedPassword },
    create: {
      Name: 'Salam (HVAC & Plumbing Specialist)',
      Email: 'plumber@campus.edu',
      Password: hashedPassword,
      Role: 'STAFF',
      Phone: '01700000005'
    }
  });

  // Student
  const studentUser = await prisma.user.upsert({
    where: { Email: 'student@campus.edu' },
    update: { Password: hashedPassword },
    create: {
      Name: 'Ratul (Student Representative)',
      Email: 'student@campus.edu',
      Password: hashedPassword,
      Role: 'STUDENT',
      Phone: '01700000003'
    }
  });

  // 5. CREATE SAMPLE WORKFLOW COMPLAINTS (CP-3 LIFECYCLE DEMO)
  const complaintCount = await prisma.complaint.count();
  if (complaintCount < 4) {
    console.log('Seeding demo lifecycle complaints with audit timeline...');
    const catElectrical = await prisma.category.findFirst({ where: { Name: { contains: 'Electrical' } } });
    const catHvac = await prisma.category.findFirst({ where: { Name: { contains: 'HVAC' } } });
    const catAv = await prisma.category.findFirst({ where: { Name: { contains: 'Multimedia' } } });
    const catPlumbing = await prisma.category.findFirst({ where: { Name: { contains: 'Plumbing' } } });

    // Ticket 1: PENDING
    const ticket1 = await prisma.complaint.create({
      data: {
        StudentID: studentUser.UserID,
        RoomID: 201,
        CategoryID: catElectrical ? catElectrical.CategoryID : 1,
        Description: 'Ceiling Fan #2 in Computer Programming Lab 1 has loose mounting bolts causing heavy noise and vibration.',
        Priority: 'HIGH',
        Status: 'PENDING',
        PhotoURL: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80'
      }
    });
    await prisma.statusLog.create({
      data: {
        ComplaintID: ticket1.ComplaintID,
        UpdatedByUserID: studentUser.UserID,
        Status: 'PENDING',
        Note: 'Complaint reported by Student Representative. Awaiting department review.'
      }
    });

    // Ticket 2: ASSIGNED
    const ticket2 = await prisma.complaint.create({
      data: {
        StudentID: studentUser.UserID,
        RoomID: 304,
        CategoryID: catHvac ? catHvac.CategoryID : 2,
        AssignedStaffID: staffKarim.UserID,
        Description: 'Split AC 2 ton unit in AI & Machine Learning Lab is leaking cold condensation water over desktop row 4.',
        Priority: 'URGENT',
        Status: 'ASSIGNED',
        PhotoURL: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80'
      }
    });
    await prisma.statusLog.createMany({
      data: [
        {
          ComplaintID: ticket2.ComplaintID,
          UpdatedByUserID: studentUser.UserID,
          Status: 'PENDING',
          Note: 'Initial report filed by student.',
          Timestamp: new Date(Date.now() - 3600000 * 5)
        },
        {
          ComplaintID: ticket2.ComplaintID,
          UpdatedByUserID: adminUser.UserID,
          Status: 'ASSIGNED',
          Note: 'Dispatched to Karim (Head of Campus Maintenance). Priority escalated to URGENT due to water near electrical equipment.',
          Timestamp: new Date(Date.now() - 3600000 * 2)
        }
      ]
    });

    // Ticket 3: IN_PROGRESS
    const ticket3 = await prisma.complaint.create({
      data: {
        StudentID: studentUser.UserID,
        RoomID: 101,
        CategoryID: catAv ? catAv.CategoryID : 4,
        AssignedStaffID: staffRafiq.UserID,
        Description: 'Overhead Optoma projector in Ground Floor Lecture Hall 1A has a burnt bulb and flashing amber error LED.',
        Priority: 'HIGH',
        Status: 'IN_PROGRESS',
        PhotoURL: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&w=600&q=80'
      }
    });
    await prisma.statusLog.createMany({
      data: [
        {
          ComplaintID: ticket3.ComplaintID,
          UpdatedByUserID: studentUser.UserID,
          Status: 'PENDING',
          Note: 'Report submitted by student.',
          Timestamp: new Date(Date.now() - 3600000 * 8)
        },
        {
          ComplaintID: ticket3.ComplaintID,
          UpdatedByUserID: adminUser.UserID,
          Status: 'ASSIGNED',
          Note: 'Assigned to Rafiq for projector diagnostics.',
          Timestamp: new Date(Date.now() - 3600000 * 4)
        },
        {
          ComplaintID: ticket3.ComplaintID,
          UpdatedByUserID: staffRafiq.UserID,
          Status: 'IN_PROGRESS',
          Note: 'Technician on-site. Removed old lamp cartridge. Replacement OEM bulb requisitioned from store room.',
          Timestamp: new Date(Date.now() - 3600000 * 1)
        }
      ]
    });

    // Ticket 4: RESOLVED
    const ticket4 = await prisma.complaint.create({
      data: {
        StudentID: studentUser.UserID,
        RoomID: 105,
        CategoryID: catPlumbing ? catPlumbing.CategoryID : 5,
        AssignedStaffID: staffSalam.UserID,
        Description: 'Washroom tap in Medical & First Aid Center had a broken washer resulting in continuous high-pressure tap leak.',
        Priority: 'MEDIUM',
        Status: 'RESOLVED',
        ResolvedAt: new Date(Date.now() - 3600000 * 3)
      }
    });
    await prisma.statusLog.createMany({
      data: [
        {
          ComplaintID: ticket4.ComplaintID,
          UpdatedByUserID: studentUser.UserID,
          Status: 'PENDING',
          Note: 'Student reported water leakage.',
          Timestamp: new Date(Date.now() - 3600000 * 24)
        },
        {
          ComplaintID: ticket4.ComplaintID,
          UpdatedByUserID: adminUser.UserID,
          Status: 'ASSIGNED',
          Note: 'Assigned to Salam (Sanitary Lead).',
          Timestamp: new Date(Date.now() - 3600000 * 18)
        },
        {
          ComplaintID: ticket4.ComplaintID,
          UpdatedByUserID: staffSalam.UserID,
          Status: 'IN_PROGRESS',
          Note: 'Turned off main riser valve. Replacing brass tap spindle and washer.',
          Timestamp: new Date(Date.now() - 3600000 * 6)
        },
        {
          ComplaintID: ticket4.ComplaintID,
          UpdatedByUserID: staffSalam.UserID,
          Status: 'RESOLVED',
          Note: 'Installation complete and pressure tested with no leaks. Area cleaned and sanitized.',
          Timestamp: new Date(Date.now() - 3600000 * 3)
        }
      ]
    });
  }

  console.log('✅ University database seeded with 7 floors (70+ rooms), multi-role users & complete maintenance lifecycle!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
