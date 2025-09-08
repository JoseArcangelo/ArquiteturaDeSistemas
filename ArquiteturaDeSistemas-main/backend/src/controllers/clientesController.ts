import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const listarClientes = async (req: Request, res: Response) => {
  const clientes = await prisma.cliente.findMany();
  res.json(clientes);
};

export const criarCliente = async (req: Request, res: Response) => {
  const { name, email } = req.body;
  if (!name || !email) return res.status(400).json({ error: 'name e email são obrigatórios' });

  try {
    const cliente = await prisma.cliente.create({ data: { name, email } });
    res.status(201).json(cliente);
  } catch (e) {
    res.status(400).json({ error: 'Erro ao criar cliente', details: (e as Error).message });
  }
};

export const pedidosDoCliente = async (req: Request, res: Response) => {
  const clienteId = Number(req.params.id);
  const pedidos = await prisma.pedido.findMany({ where: { clienteId }, include: { produtos: true, pagamentos: true, status: true } });
  res.json(pedidos);
};

export default {};
