import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { phone: '919876543210' },
    update: {},
    create: {
      name: 'Pallavi',
      phone: '919876543210',
      passwordHash: adminPassword,
      role: 'ADMIN',
    },
  });

  const demoProducts = [
    {
      title: 'Rose Gold Coaster Set',
      description: 'Set of 4 handcrafted epoxy resin coasters with rose gold leaf accents. Perfect for your living room or as a housewarming gift. Each coaster is unique with its own pattern of gold flecks.',
      category: 'Coasters',
      price: 1200,
      images: JSON.stringify(['/uploads/coaster1.jpg']),
      stock: 5,
      leadTimeDays: 3,
      isCustomizable: true,
    },
    {
      title: 'Ocean Wave Serving Tray',
      description: 'Large rectangular serving tray with a mesmerizing ocean wave design in turquoise and white resin. Finished with a high-gloss waterproof coat. Ideal for serving or as a decorative piece.',
      category: 'Trays',
      price: 2800,
      images: JSON.stringify(['/uploads/tray1.jpg']),
      stock: 2,
      leadTimeDays: 5,
      isCustomizable: false,
    },
    {
      title: 'Dried Flower Wall Clock',
      description: 'Handmade resin wall clock with real dried flowers embedded in crystal-clear resin. Minimalist design with silent quartz movement. A stunning centerpiece for any room.',
      category: 'Clocks & Art',
      price: 3500,
      images: JSON.stringify(['/uploads/clock1.jpg']),
      stock: 1,
      leadTimeDays: 7,
      isCustomizable: true,
    },
    {
      title: 'Galaxy Pendant Necklace',
      description: 'Stunning pendant necklace with swirling galaxy-inspired resin in deep purple, blue, and silver glitter. Comes on a sterling silver chain. Each piece is one-of-a-kind.',
      category: 'Jewelry',
      price: 850,
      images: JSON.stringify(['/uploads/jewelry1.jpg']),
      stock: 8,
      leadTimeDays: 2,
      isCustomizable: true,
    },
    {
      title: 'Wedding Bouquet Keepsake Box',
      description: 'Preserve your wedding bouquet forever in a luxurious resin keepsake box. The flowers are carefully arranged and encased in crystal-clear UV-resistant resin.',
      category: 'Preserved Keepsakes',
      price: 5500,
      images: JSON.stringify(['/uploads/keepsake1.jpg']),
      stock: 0,
      leadTimeDays: 14,
      isCustomizable: true,
    },
    {
      title: 'Marble Effect Coaster Set',
      description: 'Elegant set of 4 coasters with white and grey marble-effect resin. Topped with real gold foil edges. Sophisticated and modern.',
      category: 'Coasters',
      price: 1400,
      images: JSON.stringify(['/uploads/coaster2.jpg']),
      stock: 3,
      leadTimeDays: 3,
      isCustomizable: false,
    },
  ];

  for (const product of demoProducts) {
    await prisma.product.create({ data: product });
  }

  console.log('Seeded admin user and 6 demo products');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
