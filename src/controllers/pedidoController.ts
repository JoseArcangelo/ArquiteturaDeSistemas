import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const listarPedidos = async (req: Request, res: Response) => {
  const pedidos = await prisma.pedido.findMany({
    include: { produtos: true, pagamentos: true, cliente: true },
  });
  res.json(pedidos);
};

export const buscarPedido = async (req: Request, res: Response) => {
  const pedido = await prisma.pedido.findUnique({
    where: { id: Number(req.params.id) },
    include: { produtos: true, pagamentos: true, cliente: true },
  });
  if (!pedido) return res.status(404).json({ error: "Pedido não encontrado" });
  res.json(pedido);
};

export const criarPedido = async (req: Request, res: Response) => {
  const { clienteId, produtos } = req.body;

  const cliente = await prisma.cliente.findUnique({ where: { id: clienteId } });
  if (!cliente) return res.status(400).json({ error: "Cliente não encontrado" });

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
    data: { valorTotal, clienteId, status: "AGUARDANDO_PAGAMENTO" },
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
    include: { produtos: true, cliente: true },
  });

  res.status(201).json(pedidoFinal);
};

export const listarPedidosCliente = async (req: Request, res: Response) => {
  const clienteId = Number(req.params.clienteId);
  const pedidos = await prisma.pedido.findMany({
    where: { clienteId },
    include: { produtos: true, pagamentos: true },
  });
  res.json(pedidos);
};

export const confirmarPagamento = async (req: Request, res: Response) => {
  const { pedidoId, pagamentos } = req.body;

  const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } });
  if (!pedido) return res.status(404).json({ error: "Pedido não encontrado" });

  let todosAprovados = true;

  for (const p of pagamentos) {
    const aprovado = Math.random() > 0.3; // 70% de chance de aprovar

    await prisma.pagamento.create({
      data: {
        pedidoId,
        metodo: p.metodo,
        valor: p.valor,
        aprovado,
      },
    });

    if (!aprovado) todosAprovados = false;
  }

  await prisma.pedido.update({
    where: { id: pedidoId },
    data: { status: todosAprovados ? "PAGO" : "CANCELADO" },
  });

  const pedidoFinal = await prisma.pedido.findUnique({
    where: { id: pedidoId },
    include: { pagamentos: true },
  });

  res.json(pedidoFinal);
};

export const buscarPagamentosPedido = async (req: Request, res: Response) => {
  const pedidoId = Number(req.params.id);
  const pagamentos = await prisma.pagamento.findMany({ where: { pedidoId } });
  res.json(pagamentos);
};
