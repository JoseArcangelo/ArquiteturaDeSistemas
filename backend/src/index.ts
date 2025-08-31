import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import produtoRoutes from "./routes/produtoRoutes";
import pedidoRoutes from "./routes/pedidoRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Rota de teste
app.get("/", (req, res) => {
  res.json({ message: "API rodando com sucesso 🚀" });
});

// Rotas principais
app.use("/produtos", produtoRoutes);
app.use("/pedidos", pedidoRoutes);

export default app;
