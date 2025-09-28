import express from 'express';
import pkg from '@prisma/client';

const { PrismaClient } = pkg;
const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.post('/products', async (req, res) => {
  const { name, price, stock, description } = req.body;
  const product = await prisma.product.create({
    data: { name, price, stock, description }
  });
  res.status(201).json(product);
});

app.get('/products', async (_req, res) => {
  const products = await prisma.product.findMany();
  res.json(products);
});

app.get('/products/:id', async (req, res) => {
  const { id } = req.params;
  const product = await prisma.product.findUnique({
    where: { id: parseInt(id) }
  });
  if (!product) return res.status(404).json({ error: 'Produto não encontrado' });
  res.json(product);
});

// PATCH /products/:id - atualizar produto
app.patch('/products/:id', async (req, res) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: 'Produto não encontrado' });
  }
});

// DELETE /products/:id - deletar produto
app.delete('/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.product.delete({ where: { id: parseInt(id) } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: 'Produto não encontrado' });
  }
});

// PATCH /products/:id/stock - atualizar estoque
app.patch('/products/:id/stock', async (req, res) => {
  const { id } = req.params;
  const { stock } = req.body;
  try {
    const updated = await prisma.product.update({
      where: { id: parseInt(id) },
      data: { stock }
    });
    res.json(updated);
  } catch {
    res.status(404).json({ error: 'Produto não encontrado' });
  }
});

app.listen(3004, () => {
  console.log('Product service running on port 3004');
});
