const express = require('express');
const app = express();
app.use(express.json());

// Produtos - SQL (Postgres)
app.post('/products', (req, res) => {
  // criar produto no Postgres
  res.status(201).json({ message: 'product created (stub)', body: req.body });
});

app.get('/products', (req, res) => {
  res.json([{ id: 1, nome: 'Produto Exemplo', preco: 10.0, estoque: 100 }]);
});

app.patch('/products/:id', (req, res) => {
  // patch produto (sem alterar estoque aqui)
  res.json({ message: 'product updated (stub)', id: req.params.id, body: req.body });
});

app.delete('/products/:id', (req, res) => {
  res.status(204).send();
});

app.get('/products/:id', (req, res) => {
  res.json({ id: Number(req.params.id), nome: 'Produto Exemplo', preco: 10.0, estoque: 100 });
});

app.patch('/products/:id/stock', (req, res) => {
  // atualizar estoque (increment/decrement)
  res.json({ message: 'stock updated (stub)', id: req.params.id, body: req.body });
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => console.log(`Products service listening on ${PORT}`));
