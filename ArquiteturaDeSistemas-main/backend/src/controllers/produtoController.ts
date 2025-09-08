import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();

export const listarProdutos = async (req: Request, res: Response) => {
  const produtos = await prisma.produto.findMany();
  res.json(produtos);
};

export const buscarProduto = async (req: Request, res: Response) => {
  const produto = await prisma.produto.findUnique({
    where: { id: Number(req.params.id) },
  });
  if (!produto) return res.status(404).json({ error: "Produto não encontrado" });
  res.json(produto);
};

export const criarProduto = async (req: Request, res: Response) => {
  const { nome, preco, estoque } = req.body;
  const produto = await prisma.produto.create({
    data: { nome, preco, estoque },
  });
  res.status(201).json(produto);
};

export const atualizarProduto = async (req: Request, res: Response) => {
  // estoque não pode ser atualizado por aqui — existe um endpoint específico
  const { nome, preco } = req.body;
  try {
    const produto = await prisma.produto.update({
      where: { id: Number(req.params.id) },
      data: { nome, preco },
    });
    res.json(produto);
  } catch {
    res.status(404).json({ error: "Produto não encontrado" });
  }
};

export const atualizarEstoque = async (req: Request, res: Response) => {
  const { estoque } = req.body;
  if (typeof estoque !== 'number') return res.status(400).json({ error: 'Campo estoque é obrigatório e deve ser número' });
  try {
    const produto = await prisma.produto.update({
      where: { id: Number(req.params.id) },
      data: { estoque },
    });
    res.json(produto);
  } catch {
    res.status(404).json({ error: "Produto não encontrado" });
  }
};

export const deletarProduto = async (req: Request, res: Response) => {
  try {
    await prisma.produto.delete({ where: { id: Number(req.params.id) } });
    res.status(204).send();
  } catch {
    res.status(404).json({ error: "Produto não encontrado" });
  }
};
