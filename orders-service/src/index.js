import express from 'express';
import mongoose from 'mongoose';
import axios from 'axios';
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
    // Criar pagamento automaticamente
    try {
      const paymentRes = await axios.post(
        process.env.PAYMENTS_URL || 'http://payments_service:3007/payments',
        {
          orderId: order._id,
          amount: 0,
          method: 'pix'
        }
      );

      // Tentar disparar o processamento do pagamento imediatamente
      try {
        const payment = paymentRes.data;
        await axios.patch(`${process.env.PAYMENTS_URL || 'http://payments_service:3007'}/payments/${payment.id}/process`);
      } catch (procErr) {
        console.error('Error triggering payment processing:', procErr.message || procErr);
      }
    } catch (payErr) {
      console.error('Error creating payment for order:', payErr.message || payErr);
    }

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

// Obter todos pedidos de um cliente (por userId)
app.get('/orders/customer/:userId', async (req, res) => {
  const { userId } = req.params;

  // validar userId como número
  const parsedId = Number(userId);
  if (!userId || Number.isNaN(parsedId)) {
    return res.status(400).json({ error: 'Invalid or missing userId. It must be a number.' });
  }

  try {
    const orders = await Order.find({ userId: parsedId });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
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
