import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const listarPedidos = async (req: Request, res: Response) => {
  const pedidos = await prisma.pedido.findMany({ include: { produtos: true, pagamentos: true, cliente: true, status: true } });
  res.json(pedidos);
};

export const buscarPedido = async (req: Request, res: Response) => {
  const pedido = await prisma.pedido.findUnique({
    where: { id: Number(req.params.id) },
  include: { produtos: true, pagamentos: true, cliente: true, status: true },
  });
  if (!pedido) return res.status(404).json({ error: "Pedido não encontrado" });
  res.json(pedido);
};

export const criarPedido = async (req: Request, res: Response) => {
  const { produtos, clienteId } = req.body;
  // produtos = [{ produtoId, quantidade }]

  if (!clienteId) return res.status(400).json({ error: 'clienteId é obrigatório' });

  const cliente = await prisma.cliente.findUnique({ where: { id: Number(clienteId) } });
  if (!cliente) return res.status(400).json({ error: 'Cliente não encontrado' });

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

  // obter status AGUARDANDO PAGAMENTO, ou criar caso não exista
  let status = await prisma.status.findFirst({ where: { name: 'AGUARDANDO_PAGAMENTO' } });
  if (!status) {
    status = await prisma.status.create({ data: { name: 'AGUARDANDO_PAGAMENTO' } });
  }

  const pedido = await prisma.pedido.create({
    data: { valorTotal, clienteId: cliente.id, statusId: status.id },
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

export const getPagamentosDoPedido = async (req: Request, res: Response) => {
  const pedidoId = Number(req.params.id);
  const pagamentos = await prisma.pedidoPagamento.findMany({ where: { pedidoId } , include: { tipoPagamento: true }});
  res.json(pagamentos);
};

export const confirmarPagamento = async (req: Request, res: Response) => {
  const pedidoId = Number(req.params.id);
  const { pagamentos } = req.body; // [{ tipoPagamentoId, total }]

  const pedido = await prisma.pedido.findUnique({ where: { id: pedidoId } });
  if (!pedido) return res.status(404).json({ error: 'Pedido não encontrado' });

  // criar os registros de pagamento
  let allSuccess = true;
  for (const p of pagamentos) {
    const tipo = await prisma.tipoPagamento.findUnique({ where: { id: p.tipoPagamentoId } });
    if (!tipo) return res.status(400).json({ error: `Tipo de pagamento ${p.tipoPagamentoId} não encontrado` });

    // simular pagamento com Math.random()
    const success = Math.random() > 0.2; // 80% de sucesso

    await prisma.pedidoPagamento.create({
      data: { pedidoId, tipoPagamentoId: p.tipoPagamentoId, total: p.total },
    });

    if (!success) allSuccess = false;
  }

  const statusName = allSuccess ? 'PAGO' : 'CANCELADO';
  // buscar status ou criar
  let status = await prisma.status.findFirst({ where: { name: statusName } });
  if (!status) status = await prisma.status.create({ data: { name: statusName } });

  await prisma.pedido.update({ where: { id: pedidoId }, data: { statusId: status.id } });

  res.json({ success: allSuccess, status: statusName });
};
