import { Router } from "express";
import * as pedidoController from "../controllers/pedidoController";

const router = Router();

router.get("/", pedidoController.listarPedidos);
router.get("/:id", pedidoController.buscarPedido);
router.post("/", pedidoController.criarPedido);

router.get("/cliente/:clienteId", pedidoController.listarPedidosCliente);
router.post("/pagamento/confirmar", pedidoController.confirmarPagamento);
router.get("/:id/pagamentos", pedidoController.buscarPagamentosPedido);

export default router;
