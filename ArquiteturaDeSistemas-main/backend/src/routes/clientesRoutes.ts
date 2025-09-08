import { Router } from "express";
import * as clientesController from "../controllers/clientesController";

const router = Router();

router.get("/", clientesController.listarClientes);
router.post("/", clientesController.criarCliente);
router.get("/:id/pedidos", clientesController.pedidosDoCliente);

export default router;
