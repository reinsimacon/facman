import { PrismaClient, Role } from '../src/generated/prisma/index.js';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Hash password
  const password = await bcrypt.hash('admin123', 10);

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@facman.com' },
    update: {},
    create: {
      name: 'Admin',
      email: 'admin@facman.com',
      password,
      role: Role.ADMIN,
    },
  });

  // Create facilities
  const facilities = [
    '1st Floor Boys Bathroom',
    '1st Floor Girls Bathroom',
    '2nd Floor Boys Bathroom',
    '2nd Floor Girls Bathroom',
    'Warehouse',
    'Electric Room',
    'Accounting Area',
    'IT Area',
    'Engineering Area',
    'Payroll',
    'Audit',
    'Project Installation',
    'Facilities',
    'Conference Room',
    'Elevator',
    'Rooftop',
    'Garage',
  ];
  for (const name of facilities) {
    await prisma.facility.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // Create a sample announcement
  await prisma.announcement.create({
    data: {
      title: 'Welcome to Facility Management System',
      content: 'This is your new facility management dashboard. Start by creating tickets or managing facilities.',
      authorId: admin.id,
    },
  });

  console.log('Database seeded!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 