import express from 'express';
import mongoose from 'mongoose';
import { Order } from './models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Conectar MongoDB
mongoose.connect(process.env.MONGO_URL)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Criar pedido
app.post('/orders', async (req, res) => {
  const { userId, products, status } = req.body;
  try {
    const order = await Order.create({ userId, products, status });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Obter todos pedidos
app.get('/orders', async (_req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

// Obter pedido por ID
app.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Atualizar status do pedido
app.patch('/orders/:id/status', async (req, res) => {
  const { status } = req.body;
  if (!['pending', 'completed', 'canceled'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3002, () => console.log('Orders service running on port 3002'));
