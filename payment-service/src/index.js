import express from 'express';
import axios from 'axios';
import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
<<<<<<< HEAD
import { connectRabbit, sendNotification } from './rabbit.js'; 
=======
>>>>>>> b42d51ac57dd4e001d1535ce2e380eeb79442aac

dotenv.config();

const app = express();
app.use(express.json());

const prisma = new PrismaClient();

<<<<<<< HEAD
// Conecta RabbitMQ ao iniciar o serviço e só depois inicia o server
async function start() {
  await connectRabbit();

  app.listen(3007, () => console.log('Payments service running on port 3007'));
}

start();

=======
>>>>>>> b42d51ac57dd4e001d1535ce2e380eeb79442aac
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

<<<<<<< HEAD

=======
>>>>>>> b42d51ac57dd4e001d1535ce2e380eeb79442aac
app.patch('/payments/:id/process', async (req, res) => {
  const { id } = req.params;

  try {
    const payment = await prisma.payment.findUnique({ where: { id: Number(id) } });
    if (!payment) return res.status(404).json({ error: 'Payment not found' });

    const orderRes = await axios.get(`http://orders_service:3002/orders/${payment.orderId}`);
    const order = orderRes.data;

    let canProcess = true;
<<<<<<< HEAD
    let expectedAmount = 0;
    const productsDetails = [];

    // Calcula total esperado e valida estoque
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

=======

    for (const item of order.products) {
      const productRes = await axios.get(`http://products_service:3006/products/${item.productId}`);
      const product = productRes.data;
>>>>>>> b42d51ac57dd4e001d1535ce2e380eeb79442aac
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

<<<<<<< HEAD
    // Verifica valor pago
    const paid = Number(payment.amount || 0);
    const diff = Math.abs(paid - expectedAmount);
    if (diff > 0.01) {
      await prisma.payment.update({ where: { id: Number(id) }, data: { status: 'canceled' } });
      await axios.patch(`http://orders_service:3002/orders/${payment.orderId}/status`, { status: 'canceled' });
      return res.status(400).json({ error: 'Payment amount mismatch', expectedAmount, paid });
    }

    // Atualiza estoque
    for (const item of order.products) {
      const detail = productsDetails.find(p => p.productId === item.productId);
      if (detail) {
        await axios.patch(`http://products_service:3006/products/${item.productId}/stock`, {
          stock: detail.stock - detail.quantity
        });
      }
=======
    for (const item of order.products) {
      const productRes = await axios.get(`http://products_service:3006/products/${item.productId}`);
      const product = productRes.data;
      await axios.patch(`http://products_service:3006/products/${item.productId}/stock`, {
        stock: product.stock - item.quantity
      });
>>>>>>> b42d51ac57dd4e001d1535ce2e380eeb79442aac
    }

    await prisma.payment.update({ where: { id: Number(id) }, data: { status: 'completed' } });
    await axios.patch(`http://orders_service:3002/orders/${payment.orderId}/status`, { status: 'completed' });

<<<<<<< HEAD
    // 🟡 >> Aqui enviamos o evento RabbitMQ <<
    sendNotification({
      type: 'ORDER_COMPLETED',
      userId: order.userId,
      orderId: payment.orderId,
      message: 'Pagamento confirmado e pedido concluído',
      products: productsDetails
    });

=======
>>>>>>> b42d51ac57dd4e001d1535ce2e380eeb79442aac
    res.json({ message: 'Payment processed successfully' });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

<<<<<<< HEAD

=======
>>>>>>> b42d51ac57dd4e001d1535ce2e380eeb79442aac
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

<<<<<<< HEAD

// (server started inside start())
=======
app.listen(3007, () => console.log('Payments service running on port 3007'));
>>>>>>> b42d51ac57dd4e001d1535ce2e380eeb79442aac
