const express = require('express');
const connectRabbit = require('./rabbit');
const app = express();
const port = process.env.PORT || 3005;

app.use(express.json());

// Health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'notification-service' });
});

// Manual test
app.post('/notify', (req, res) => {
  const { userId, orderId, message } = req.body || {};

  if (!userId || !orderId) {
    return res.status(400).json({ success: false, error: 'userId and orderId are required' });
  }

  console.log('📨 Notification sent manually:', { userId, orderId, message });
  return res.json({ success: true, message: 'Manual notification sent' });
});

// Start server + RabbitMQ listener
app.listen(port, () => {
  console.log(`notification-service listening on port ${port}`);
  connectRabbit();
});
