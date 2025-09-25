const express = require('express');
const mongoose = require('mongoose');
const app = express();
app.use(express.json());

// Conexão com Mongo (usar MONGO_URL env)
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017/orders_db';
mongoose.connect(MONGO_URL).then(() => console.log('Connected to MongoDB')).catch(() => console.log('Mongo connection failed (stub)'));

// Endpoints orders (MongoDB)
app.post('/orders', (req, res) => {
  // Criar pedido em Mongo
  res.status(201).json({ message: 'order created (stub)', body: req.body });
});

app.get('/orders', (req, res) => {
  res.json([{ id: '64abc', clienteId: 1, valorTotal: 100.0, status: 'AGUARDANDO_PAGAMENTO' }]);
});

app.get('/orders/:id', (req, res) => {
  res.json({ id: req.params.id, clienteId: 1, valorTotal: 100.0, status: 'AGUARDANDO_PAGAMENTO', produtos: [] });
});

app.patch('/orders/:id/status', (req, res) => {
  // atualizar status do pedido
  res.json({ message: 'status updated (stub)', id: req.params.id, body: req.body });
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => console.log(`Orders service listening on ${PORT}`));
