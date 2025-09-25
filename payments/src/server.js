const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Payments - SQL (Postgres)
app.post('/payments', (req, res) => {
  // Criar pagamento em Postgres
  res.status(201).json({ message: 'payment created (stub)', body: req.body });
});

// Atualizar produtos relacionados a um pagamento (opcional comportamento descrito)
app.patch('/payments/:id/products', (req, res) => {
  res.json({ message: 'payment products patched (stub)', id: req.params.id, body: req.body });
});

// Buscar pagamento por order_id
app.get('/payments/:order_id', (req, res) => {
  res.json([{ id: 1, orderId: req.params.order_id, metodo: 'cartao', valor: 100.0, aprovado: false }]);
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Payments service listening on ${PORT}`));

// Endpoint to orchestrate processing of a payment for an order
// Calls Orders service and Products service to check/decrement stock and update order status.
app.post('/payments/process/:orderId', async (req, res) => {
  const axios = require('axios');
  const orderId = req.params.orderId;
  try {
    // 1) Get order details from Orders service
    const orderResp = await axios.get(`${process.env.ORDERS_URL || 'http://localhost:3003'}/orders/${orderId}`);
    const order = orderResp.data;
    if (!order || !order.produtos) return res.status(400).json({ error: 'Pedido inválido ou sem produtos' });

    // 2) Check stock for each product
    for (const item of order.produtos) {
      const pResp = await axios.get(`${process.env.PRODUCTS_URL || 'http://localhost:3002'}/products/${item.produtoId}`);
      const product = pResp.data;
      if (!product) return res.status(400).json({ error: `Produto ${item.produtoId} não encontrado` });
      if (product.estoque < item.quantidade) {
        // update order status to FALHA_NO_PAGAMENTO
        await axios.patch(`${process.env.ORDERS_URL || 'http://localhost:3003'}/orders/${orderId}/status`, { status: 'FALHA_NO_PAGAMENTO' });
        return res.status(400).json({ error: `Estoque insuficiente para produto ${product.nome}` });
      }
    }

    // 3) Decrement stock for each product
    for (const item of order.produtos) {
      await axios.patch(`${process.env.PRODUCTS_URL || 'http://localhost:3002'}/products/${item.produtoId}/stock`, { delta: -item.quantidade });
    }

    // 4) Update order status to PAGO
    await axios.patch(`${process.env.ORDERS_URL || 'http://localhost:3003'}/orders/${orderId}/status`, { status: 'PAGO' });

    return res.json({ success: true, orderId });
  } catch (err) {
    console.error(err.message || err);
    try { await require('axios').patch(`${process.env.ORDERS_URL || 'http://localhost:3003'}/orders/${orderId}/status`, { status: 'FALHA_NO_PAGAMENTO' }); } catch (_) {}
    return res.status(500).json({ error: 'Erro ao processar pagamento' });
  }
});
