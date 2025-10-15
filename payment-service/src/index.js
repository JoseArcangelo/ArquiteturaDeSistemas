import express from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());

const prisma = new PrismaClient();

app.post('/payments', async (req, res) => {
  const { orderId, amount, method } = req.body;

  try {
    const payment = await prisma.payment.create({
      data: { orderId, amount, status: 'pending', method }
    });
    res.json(payment);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.patch('/payments/:id/process', async (req, res) => {
  const { id } = req.params;

  try {
    const payment = await prisma.payment.findUnique({ where: { id: Number(id) } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const orderRes = await axios.get(`http://orders_service:3002/orders/${payment.orderId}`);
    const order = orderRes.data;

    let canProcess = true;
    let expectedAmount = 0;
    const productsDetails = [];

    // Fetch product details once, compute expected total and check stock
    for (const item of order.products) {
      const productRes = await axios.get(`http://products_service:3006/products/${item.productId}`);
      const product = productRes.data;
      productsDetails.push({
        productId: item.productId,
        name: product.name,
        price: product.price,
        stock: product.stock,
        quantity: item.quantity
      });

      expectedAmount += (product.price || 0) * item.quantity;

      if (product.stock < item.quantity) {
        canProcess = false;
        break;
      }
    }

    if (!canProcess) {
      await prisma.payment.update({ where: { id: Number(id) }, data: { status: 'canceled' } });
      await axios.patch(`http://orders_service:3002/orders/${payment.orderId}/status`, { status: 'canceled' });
      return res.status(400).json({ error: 'Not enough stock, order canceled' });
    }

    // Validate payment amount matches expected total (allow minor floating point differences)
    const paid = Number(payment.amount || 0);
    const diff = Math.abs(paid - expectedAmount);
    if (diff > 0.01) {
      // Amount mismatch: cancel payment and order
      await prisma.payment.update({ where: { id: Number(id) }, data: { status: 'canceled' } });
      await axios.patch(`http://orders_service:3002/orders/${payment.orderId}/status`, { status: 'canceled' });
      return res.status(400).json({ error: 'Payment amount does not match order total, order canceled', expectedAmount, paid });
    }

    for (const item of order.products) {
      // update stock using previously fetched product details
      const detail = productsDetails.find(p => p.productId === item.productId);
      if (detail) {
        await axios.patch(`http://products_service:3006/products/${item.productId}/stock`, {
          stock: detail.stock - detail.quantity
        });
      } else {
        // fallback: fetch product and update
        const productRes = await axios.get(`http://products_service:3006/products/${item.productId}`);
        const product = productRes.data;
        await axios.patch(`http://products_service:3006/products/${item.productId}/stock`, {
          stock: product.stock - item.quantity
        });
      }
    }

    await prisma.payment.update({ where: { id: Number(id) }, data: { status: 'completed' } });
    await axios.patch(`http://orders_service:3002/orders/${payment.orderId}/status`, { status: 'completed' });

    // Notify user about completed order (best-effort)
    try {
      await axios.post(`http://notification_service:3005/notify`, {
        userId: order.userId,
        orderId: payment.orderId,
        message: 'Pagamento confirmado e pedido concluído',
        products: productsDetails
      });
    } catch (notifyErr) {
      console.error('Failed to send notification:', notifyErr.message || notifyErr);
      // don't fail the process if notification fails
    }

    res.json({ message: 'Payment processed successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/payments', async (req, res) => {
  const { 'order-id': orderId } = req.query;
  try {
    const payments = await prisma.payment.findMany({
      where: { orderId }
    });
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(3007, () => console.log('Payments service running on port 3007'));
