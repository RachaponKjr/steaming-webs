import { PrismaClient, AdminRole } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.SEED_ADMIN_EMAIL ?? 'superadmin@example.com';
  const plainPassword =
    process.env.SEED_ADMIN_PASSWORD ?? 'ChangeThisPassword123';

  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) {
    console.log('Super admin มีอยู่แล้ว ข้ามการสร้าง');
    return;
  }

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.admin.create({
    data: {
      email,
      password: hashedPassword,
      name: 'Super Admin',
      role: AdminRole.SUPER_ADMIN,
    },
  });

  console.log('สร้าง super admin สำเร็จ:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
