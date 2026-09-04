import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

// ---------------------------------------------------------------------------
// seedIfEmpty
// ---------------------------------------------------------------------------
// Chamado uma vez no bootstrap (main.ts). Só popula o banco se estiver
// vazio — assim não duplica dados em restart local, mas garante dados
// "permanentes" a cada cold start em ambientes serverless (onde o SQLite
// é recriado do zero a cada execução).
// ---------------------------------------------------------------------------

const TIPOS_VIOLACAO = [
  'Recusa de atendimento',
  'Ofensa verbal',
  'Discriminação no ambiente de trabalho',
  'Impedimento de uso de vestimenta religiosa',
  'Agressão física',
  'Vandalismo ao terreiro',
  'Constrangimento em local público',
  'Recusa de matrícula escolar',
];

const LOCAIS = [
  'Posto de Saúde Central',
  'UPA Zona Norte',
  'Hospital Municipal',
  'Escola Estadual',
  'Via pública',
  'Ambiente de trabalho',
  'Órgão público',
  'Transporte coletivo',
];

const COMUNIDADES = [
  'Terreiro Ilê Axé Oyá',
  'Casa de Caridade São Jorge',
  'Terreiro Ogum Megê',
  'Centro Espírita Pai Joaquim',
  'Terreiro Ilê Omolu',
  'Casa de Oxum',
  'Terreiro Nzo Kimbanda',
  'Tenda Espírita Cosme e Damião',
];

const STATUSES = ['novo', 'em_analise', 'encaminhado', 'resolvido'];

function randomDate(daysBack: number): Date {
  const now = Date.now();
  const past = now - Math.random() * daysBack * 24 * 60 * 60 * 1000;
  return new Date(past);
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export async function seedIfEmpty(prisma: PrismaClient) {
  const userCount = await prisma.user.count();
  if (userCount > 0) {
    console.log('[seed] Banco já populado, pulando seed.');
    return;
  }

  console.log('[seed] Banco vazio — populando com dados de exemplo...');

  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  const admin = await prisma.user.create({
    data: {
      email: 'admin@erp.com',
      name: 'Administrador',
      password: adminPassword,
      role: 'admin',
    },
  });

  const usuariosComuns = await Promise.all(
    [
      { email: 'maria@erp.com', name: 'Maria Santos' },
      { email: 'joao@erp.com', name: 'João Pereira' },
      { email: 'ana@erp.com', name: 'Ana Oliveira' },
    ].map((u) =>
      prisma.user.create({
        data: {
          email: u.email,
          name: u.name,
          password: userPassword,
          role: 'user',
        },
      }),
    ),
  );

  const todosUsuarios = [admin, ...usuariosComuns];

  const relatosData = Array.from({ length: 16 }, () => {
    const autor = pick(usuariosComuns); // relatos "de exemplo" pertencem a usuários comuns
    return {
      comunidade: pick(COMUNIDADES),
      tipoViolacao: pick(TIPOS_VIOLACAO),
      descricao:
        'Relato de exemplo gerado automaticamente para fins de demonstração do sistema.',
      local: pick(LOCAIS),
      dataOcorrido: randomDate(90),
      status: pick(STATUSES),
      userId: autor.id,
    };
  });

  await prisma.relato.createMany({ data: relatosData });

  console.log(
    `[seed] Criados: ${todosUsuarios.length} usuários, ${relatosData.length} relatos.`,
  );
  console.log('[seed] Login admin: admin@erp.com / admin123');
  console.log('[seed] Login usuário comum: maria@erp.com / user123');
}
