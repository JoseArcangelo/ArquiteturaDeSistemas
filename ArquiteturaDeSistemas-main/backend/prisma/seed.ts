import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Seed statuses
  const statuses = [
  { name: 'AGUARDANDO_PAGAMENTO' },
  { name: 'FALHA_NO_PAGAMENTO' },
  { name: 'PAGO' },
  { name: 'CANCELADO' },
  ];

  for (const s of statuses) {
    await prisma.status.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
  }

  // Seed payment types
  const tipos = [
    { name: 'PIX' },
    { name: 'BOLETO' },
    { name: 'CREDITO' },
  ];

  for (const t of tipos) {
    await prisma.tipoPagamento.upsert({
      where: { name: t.name },
      update: {},
      create: t,
    });
  }

  console.log('Seed concluído');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
