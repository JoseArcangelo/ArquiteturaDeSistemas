import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const listarPedidos = async (req: Request, res: Response) => {
  const pedidos = await prisma.pedido.findMany({ include: { produtos: true } });
  res.json(pedidos);
};

export const buscarPedido = async (req: Request, res: Response) => {
  const pedido = await prisma.pedido.findUnique({
    where: { id: Number(req.params.id) },
    include: { produtos: true },
  });
  if (!pedido) return res.status(404).json({ error: "Pedido não encontrado" });
  res.json(pedido);
};

export const criarPedido = async (req: Request, res: Response) => {
  const { produtos } = req.body;
  // produtos = [{ produtoId, quantidade }]

  let valorTotal = 0;
  const updates: any[] = [];

  for (const item of produtos) {
    const produto = await prisma.produto.findUnique({ where: { id: item.produtoId } });

    if (!produto) return res.status(400).json({ error: `Produto ${item.produtoId} não encontrado` });
    if (produto.estoque < item.quantidade) {
      return res.status(400).json({ error: `Estoque insuficiente para ${produto.nome}` });
    }

    const valorUnit = produto.preco;
    const valorItem = valorUnit * item.quantidade;
    valorTotal += valorItem;

    updates.push({ produto, quantidade: item.quantidade, valorUnit, valorItem });
  }

  const pedido = await prisma.pedido.create({
    data: { valorTotal },
  });

  for (const u of updates) {
    await prisma.pedidoProduto.create({
      data: {
        pedidoId: pedido.id,
        produtoId: u.produto.id,
        quantidade: u.quantidade,
        valorUnit: u.valorUnit,
        valorTotal: u.valorItem,
      },
    });

    await prisma.produto.update({
      where: { id: u.produto.id },
      data: { estoque: u.produto.estoque - u.quantidade },
    });
  }

  const pedidoFinal = await prisma.pedido.findUnique({
    where: { id: pedido.id },
    include: { produtos: true },
  });

  res.status(201).json(pedidoFinal);
};
