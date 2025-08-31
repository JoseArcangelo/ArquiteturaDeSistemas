import { Router } from "express";
import * as produtoController from "../controllers/produtoController";

const router = Router();

router.get("/", produtoController.listarProdutos);
router.get("/:id", produtoController.buscarProduto);
router.post("/", produtoController.criarProduto);
router.put("/:id", produtoController.atualizarProduto);
router.delete("/:id", produtoController.deletarProduto);

export default router;
