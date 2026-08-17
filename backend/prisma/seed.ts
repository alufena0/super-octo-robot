import { PrismaClient } from '@prisma/client';
import { seedProducts } from './seeders/products';
import { seedUsers } from './seeders/users';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpando banco...');
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  console.log('Seedando produtos...');
  await seedProducts(prisma);

  console.log('Seedando usuários...');
  await seedUsers(prisma);

  console.log('Seed concluído.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
