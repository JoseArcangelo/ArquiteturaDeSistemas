import mongoose from "mongoose";

// Buscar pedido por ID (com validação do ObjectId)
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

// Buscar status do pedido (com validação do ObjectId)
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
