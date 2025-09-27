import express from 'express';
import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const app = express();

app.use(express.json());

// GET: lista todos os usuários
app.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany();
  res.json(users);
});

// POST: cria um novo usuário
app.post('/users', async (req, res) => {
  const { name, email, orders } = req.body;
  const user = await prisma.user.create({
    data: { name, email, orders }
  });
  res.status(201).json(user);
});

// Porta 3003
app.listen(3003, () => {
  console.log('User service running on port 3003');
});
