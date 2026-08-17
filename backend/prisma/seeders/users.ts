import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const data = [
  {
    email: 'admin@erp.com',
    password: 'admin123',
    name: 'Administrador',
    role: 'admin',
  },
];

export async function seedUsers(prisma: PrismaClient) {
  for (const user of data) {
    const hash = await bcrypt.hash(user.password, 10);
    await prisma.user.create({
      data: {
        email: user.email,
        password: hash,
        name: user.name,
        role: user.role,
      },
    });
  }
  console.log(`  ${data.length} usuário(s) criado(s).`);
}
