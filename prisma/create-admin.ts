// Creates or resets exactly one AdminUser — nothing else. Safe to run
// against production: unlike `prisma/seed.ts`, it never touches the
// catalog (categories, products, collections, coupons). Upserts by email,
// so re-running it for an existing address just resets that account's
// password and role.
//
// Usage:
//   ADMIN_EMAIL=you@yourdomain.com ADMIN_PASSWORD='a real strong password' \
//     npm run create-admin
//
// Optional: ADMIN_NAME (defaults to "Admin"), ADMIN_ROLE (defaults to
// SUPER_ADMIN — one of SUPER_ADMIN, ADMIN, EDITOR, PARTNER).
import 'dotenv/config';
import { AdminRole, PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? 'Admin';
  const roleInput = process.env.ADMIN_ROLE ?? 'SUPER_ADMIN';

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD are required.');
    process.exit(1);
  }
  if (password.length < 10) {
    console.error('ADMIN_PASSWORD must be at least 10 characters.');
    process.exit(1);
  }
  if (!Object.values(AdminRole).includes(roleInput as AdminRole)) {
    console.error(
      `ADMIN_ROLE must be one of: ${Object.values(AdminRole).join(', ')}`,
    );
    process.exit(1);
  }
  const role = roleInput as AdminRole;

  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await prisma.adminUser.upsert({
    where: { email: email.toLowerCase() },
    update: { passwordHash, role, isActive: true },
    create: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role,
      isActive: true,
    },
  });
  console.log(`Ready: ${admin.email} (${admin.role})`);
}

main()
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
