import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import produtoRoutes from "./routes/produtoRoutes";
import pedidoRoutes from "./routes/pedidoRoutes";
import clienteRoutes from "./routes/clienteRoutes";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());


app.use("/clientes", clienteRoutes);
app.use("/produtos", produtoRoutes);
app.use("/pedidos", pedidoRoutes);

export default app;
