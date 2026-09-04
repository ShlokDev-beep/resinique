import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function setupAdmin() {
  const phone = process.argv[2] || '919876543210';
  const password = process.argv[3] || 'admin123';
  const name = process.argv[4] || 'Pallavi';

  console.log(`Setting up admin user...`);

  const passwordHash = await bcrypt.hash(password, 10);

  const admin = await prisma.user.upsert({
    where: { phone },
    update: {
      name,
      passwordHash,
      role: 'ADMIN',
    },
    create: {
      name,
      phone,
      passwordHash,
      role: 'ADMIN',
    },
  });

  console.log(`Admin user created/updated:`);
  console.log(`  Name:  ${admin.name}`);
  console.log(`  Phone: ${admin.phone}`);
  console.log(`  Role:  ${admin.role}`);
  console.log(`  ID:    ${admin.id}`);
  console.log(`\nLogin at /login with phone: ${phone}`);
}

setupAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
