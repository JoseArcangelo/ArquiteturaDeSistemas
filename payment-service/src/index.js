import express from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const prisma = new PrismaClient();

// Criar pagamento
app.post('/payments', async (req, res) => {
  const { orderId, amount } = req.body;

  try {
    const payment = await prisma.payment.create({
      data: { orderId, amount, status: 'pending' }
    });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Processar pagamento
app.patch('/payments/:id/process', async (req, res) => {
  const { id } = req.params;

  try {
    // 1️⃣ Buscar pagamento
    const payment = await prisma.payment.findUnique({ where: { id: Number(id) } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    // 2️⃣ Buscar pedido
    const orderRes = await axios.get(`http://orders_service:3002/orders/${payment.orderId}`);
    const order = orderRes.data;

    let canProcess = true;

    // 3️⃣ Verificar estoque para cada produto
    for (const item of order.products) {
      const productRes = await axios.get(`http://products_service:3006/products/${item.productId}`);
      const product = productRes.data;
      if (product.stock < item.quantity) {
        canProcess = false;
        break;
      }
    }

    if (!canProcess) {
      // Cancelar pagamento e pedido
      await prisma.payment.update({ where: { id: Number(id) }, data: { status: 'canceled' } });
      await axios.patch(`http://orders_service:3002/orders/${payment.orderId}/status`, { status: 'canceled' });
      return res.status(400).json({ error: 'Not enough stock, order canceled' });
    }

    // 4️⃣ Atualizar estoque
    for (const item of order.products) {
      const productRes = await axios.get(`http://products_service:3006/products/${item.productId}`);
      const product = productRes.data;
      await axios.patch(`http://products_service:3006/products/${item.productId}/stock`, {
        stock: product.stock - item.quantity
      });
    }

    // 5️⃣ Atualizar status pagamento e pedido
    await prisma.payment.update({ where: { id: Number(id) }, data: { status: 'completed' } });
    await axios.patch(`http://orders_service:3002/orders/${payment.orderId}/status`, { status: 'completed' });

    res.json({ message: 'Payment processed successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Buscar pagamentos por orderId
app.get('/payments', async (req, res) => {
  const { 'order-id': orderId } = req.query;
  try {
    const payments = await prisma.payment.findMany({
      where: { orderId: Number(orderId) }
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3007, () => console.log('Payments service running on port 3007'));
