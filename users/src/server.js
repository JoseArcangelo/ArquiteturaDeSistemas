const express = require('express');
const app = express();
app.use(express.json());

// Endpoints mínimos de users (clients)
app.post('/clients', (req, res) => {
  // aqui você ligaria ao DB SQL (Postgres) para criar cliente
  res.status(201).json({ message: 'client created (stub)', body: req.body });
});

app.get('/clients', (req, res) => {
  // aqui você listaria clients do Postgres
  res.json([{ id: 1, nome: 'Cliente Exemplo', email: 'ex@example.com' }]);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Users service listening on ${PORT}`));
