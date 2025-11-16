const express = require('express');
<<<<<<< HEAD
const connectRabbit = require('./rabbit');
=======
>>>>>>> b42d51ac57dd4e001d1535ce2e380eeb79442aac
const app = express();
const port = process.env.PORT || 3005;

app.use(express.json());

<<<<<<< HEAD
// Health check
=======

>>>>>>> b42d51ac57dd4e001d1535ce2e380eeb79442aac
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

<<<<<<< HEAD
// Manual test
=======
>>>>>>> b42d51ac57dd4e001d1535ce2e380eeb79442aac
app.post('/notify', (req, res) => {
  const { userId, orderId, message } = req.body || {};

  if (!userId || !orderId) {
    return res.status(400).json({ success: false, error: 'userId and orderId are required' });
  }

<<<<<<< HEAD
  console.log('📨 Notification sent manually:', { userId, orderId, message });
  return res.json({ success: true, message: 'Manual notification sent' });
});

// Start server + RabbitMQ listener
app.listen(port, () => {
  console.log(`notification-service listening on port ${port}`);
  connectRabbit();
=======
  const notification = {
    id: Math.floor(Math.random() * 1000000),
    timestamp: new Date().toISOString(),
    type: 'ORDER_COMPLETED',
    userId,
    orderId,
    message: message || 'Pedido realizado com sucesso',
    details: {
      title: '🎉 Pedido Confirmado!',
      body: `Olá! Seu pedido #${orderId} foi confirmado e está a caminho.`,
      sentVia: ['email', 'push'] 
    }
  };

  console.log('📨 Notification sent:', JSON.stringify(notification, null, 2));

  return res.json({ 
    success: true, 
    notification,
    message: 'Notification sent successfully'
  });
});

app.listen(port, () => {
  console.log(`notification-service listening on port ${port}`);
>>>>>>> b42d51ac57dd4e001d1535ce2e380eeb79442aac
});
