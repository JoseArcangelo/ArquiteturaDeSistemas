import { Router } from "express";
import * as clienteController from "../controllers/clienteController";

const router = Router();

router.post("/", clienteController.criarCliente); 
router.get("/", clienteController.listarClientes); 

export default router;
