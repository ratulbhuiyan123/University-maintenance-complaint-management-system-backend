const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // 1. Create Buildings
  const academicBuilding = await prisma.building.upsert({
    where: { BuildingID: 1 },
    update: {},
    create: {
      BuildingID: 1,
      Name: 'Academic Building 1'
    }
  });

  const libraryBuilding = await prisma.building.upsert({
    where: { BuildingID: 2 },
    update: {},
    create: {
      BuildingID: 2,
      Name: 'Central Library'
    }
  });

  // 2. Create Rooms
  await prisma.room.upsert({
    where: { RoomID: 101 },
    update: {},
    create: {
      RoomID: 101,
      BuildingID: academicBuilding.BuildingID,
      RoomNumber: 'Lab-302'
    }
  });

  await prisma.room.upsert({
    where: { RoomID: 102 },
    update: {},
    create: {
      RoomID: 102,
      BuildingID: libraryBuilding.BuildingID,
      RoomNumber: 'Reading-Room-A'
    }
  });

  // 3. Create Categories
  const categories = [
    { Name: 'Electrical (AC / Fan / Lights)', DefaultPriority: 'HIGH' },
    { Name: 'IT & Network (Wi-Fi / Projector)', DefaultPriority: 'URGENT' },
    { Name: 'Plumbing (Water / Washroom)', DefaultPriority: 'MEDIUM' },
    { Name: 'Carpentry & Furniture', DefaultPriority: 'LOW' }
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { Name: cat.Name },
      update: {},
      create: cat
    });
  }

  // 4. Create Default Users
  const hashedPassword = await bcrypt.hash('password123', 12);

  // Admin
  await prisma.user.upsert({
    where: { Email: 'admin@campus.edu' },
    update: {},
    create: {
      Name: 'Campus Admin',
      Email: 'admin@campus.edu',
      Password: hashedPassword,
      Role: 'ADMIN',
      Phone: '01700000001'
    }
  });

  // Staff
  await prisma.user.upsert({
    where: { Email: 'staff@campus.edu' },
    update: {},
    create: {
      Name: 'Karim (Maintenance Staff)',
      Email: 'staff@campus.edu',
      Password: hashedPassword,
      Role: 'STAFF',
      Phone: '01700000002'
    }
  });

  // Student
  await prisma.user.upsert({
    where: { Email: 'student@campus.edu' },
    update: {},
    create: {
      Name: 'Ratul (Student)',
      Email: 'student@campus.edu',
      Password: hashedPassword,
      Role: 'STUDENT',
      Phone: '01700000003'
    }
  });

  console.log('Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
