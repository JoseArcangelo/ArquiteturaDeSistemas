import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Order from "./models/Order.js";

dotenv.config();

const app = express();
app.use(express.json());

// Conexão com MongoDB
mongoose.connect(process.env.MONGO_URL, {
  user: "admin",
  pass: "admin",
  dbName: "orders_db",
  authSource: "admin"
})
.then(() => console.log("MongoDB conectado com sucesso!"))
.catch(err => console.error("Erro ao conectar MongoDB:", err));

// --- ROTAS ---

// Criar pedido
app.post("/orders", async (req, res) => {
  const { userId, products, paymentType } = req.body;

  if (!userId || !products || !Array.isArray(products)) {
    return res.status(400).json({ error: "Campos obrigatórios ausentes ou inválidos" });
  }

  try {
    const order = new Order({ userId, products, paymentType });
    await order.save();
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: "Erro ao criar pedido", details: err.message });
  }
});

// Buscar pedido por ID
app.get("/orders/:id", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar pedido", details: err.message });
  }
});

// Buscar status do pedido
app.get("/orders/:id/status", async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  try {
    const order = await Order.findById(id);
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
    res.json({ id: order._id, status: order.status });
  } catch (err) {
    res.status(500).json({ error: "Erro ao buscar status", details: err.message });
  }
});

// Atualizar status do pedido
app.patch("/orders/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID inválido" });
  }

  if (!["em_processamento", "SUCESSO", "CANCELADO"].includes(status)) {
    return res.status(400).json({ error: "Status inválido" });
  }

  try {
    const order = await Order.findByIdAndUpdate(id, { status }, { new: true });
    if (!order) return res.status(404).json({ error: "Pedido não encontrado" });
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: "Erro ao atualizar status", details: err.message });
  }
});

// --- INICIALIZAÇÃO ---
const PORT = process.env.PORT || 3005;
app.listen(PORT, () => console.log(`Order service running on port ${PORT}`));
