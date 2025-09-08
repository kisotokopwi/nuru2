import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.js';

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@nuru.local';
  const adminPass = process.env.SEED_ADMIN_PASSWORD || 'ChangeMeNow!123';

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (existing) {
    console.log('Admin already exists:', adminEmail);
    return;
  }
  const password = await hashPassword(adminPass);
  const user = await prisma.user.create({ data: { email: adminEmail, password, role: 'ADMIN', isActive: true } });
  console.log('Created admin:', user.email);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});

