import { Router } from "express";
import * as pedidoController from "../controllers/pedidoController";

const router = Router();

router.get("/", pedidoController.listarPedidos);
router.get("/:id", pedidoController.buscarPedido);
router.post("/", pedidoController.criarPedido);

export default router;
