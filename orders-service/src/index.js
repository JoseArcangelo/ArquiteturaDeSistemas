import express from 'express';
import mongoose from 'mongoose';
import { Order } from './models/Order.js';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

// Retry logic para conexão MongoDB
const maxRetries = 10;
const baseDelay = 1000; // 1s

async function connectMongoDB(attempt = 1) {
  try {
    await mongoose.connect(process.env.MONGO_URL, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      retryWrites: true,
    });
    console.log('✅ MongoDB connected');
  } catch (err) {
    const delay = baseDelay * Math.min(30, 2 ** (attempt - 1));
    console.error(`❌ MongoDB connection failed (attempt ${attempt}/${maxRetries}):`, err.message);
    if (attempt < maxRetries) {
      console.log(`⏳ Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
      return connectMongoDB(attempt + 1);
    }
    console.error('🚨 Could not connect to MongoDB after retries');
    throw err;
  }
}

// Conectar ao banco antes de iniciar o servidor
await connectMongoDB();

app.post('/orders', async (req, res) => {
  const { userId, products, status } = req.body;
  try {
    const order = await Order.create({ userId, products, status });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/orders', async (_req, res) => {
  const orders = await Order.find();
  res.json(orders);
});

app.get('/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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
