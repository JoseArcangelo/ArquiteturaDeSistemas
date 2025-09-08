import { Router } from "express";
import * as pedidoController from "../controllers/pedidoController";

const router = Router();

router.get("/", pedidoController.listarPedidos);
router.get("/:id", pedidoController.buscarPedido);
router.post("/", pedidoController.criarPedido);
router.get("/:id/pagamentos", pedidoController.getPagamentosDoPedido);
router.post("/:id/pagamentos/confirmar", pedidoController.confirmarPagamento);

export default router;
