import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const staffPassword = await bcrypt.hash('Staff123!', 12);
  const customerPassword = await bcrypt.hash('Customer123!', 12);

  await prisma.user.upsert({
    where: { email: 'admin@inventrix.com' },
    update: {},
    create: { email: 'admin@inventrix.com', password: adminPassword, name: 'Admin User', role: 'admin' },
  });

  await prisma.user.upsert({
    where: { email: 'staff@inventrix.com' },
    update: {},
    create: { email: 'staff@inventrix.com', password: staffPassword, name: 'Staff User', role: 'staff' },
  });

  await prisma.user.upsert({
    where: { email: 'customer@inventrix.com' },
    update: {},
    create: { email: 'customer@inventrix.com', password: customerPassword, name: 'Customer User', role: 'customer' },
  });

  const products = [
    { name: 'Laptop Pro 15"', description: 'High-performance laptop with 16GB RAM', price: 1299.99, stock: 25, imageUrl: '/images/laptop.png' },
    { name: 'Wireless Mouse', description: 'Ergonomic wireless mouse', price: 29.99, stock: 150, imageUrl: '/images/wireless-mouse.png' },
    { name: 'Mechanical Keyboard', description: 'RGB backlit mechanical keyboard', price: 89.99, stock: 75, imageUrl: '/images/mechanical-keyboard.png' },
    { name: 'USB-C Hub', description: '7-in-1 USB-C hub with HDMI', price: 49.99, stock: 100, imageUrl: '/images/usb-hub.png' },
    { name: 'Monitor 27" 4K', description: 'Ultra HD 4K monitor with HDR', price: 449.99, stock: 40, imageUrl: '/images/monitor.png' },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.name.toLowerCase().replace(/[^a-z0-9]/g, '-') },
      update: {},
      create: p,
    });
  }

  console.log('Seed completed');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
