const express = require('express');
const app = express();
const port = process.env.PORT || 3005;

app.use(express.json());


app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

app.post('/notify', (req, res) => {
  const { userId, orderId, message } = req.body || {};

  if (!userId || !orderId) {
    return res.status(400).json({ success: false, error: 'userId and orderId are required' });
  }

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
});
