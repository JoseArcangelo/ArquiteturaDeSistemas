import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

// Criar cliente
export const criarCliente = async (req: Request, res: Response) => {
  const { nome, email } = req.body;

  try {
    const cliente = await prisma.cliente.create({
      data: { nome, email },
    });
    res.status(201).json(cliente);
  } catch (error: any) {
    console.log(error);
    res.status(400).json({
      error: "Erro ao cadastrar cliente, verifique se o email já não existe.",
    });
  }
};

export const listarClientes = async (_req: Request, res: Response) => {
  const clientes = await prisma.cliente.findMany();
  res.json(clientes);
};
