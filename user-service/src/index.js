import express from 'express'
import { PrismaClient } from '@prisma/client'

const app = express()
const prisma = new PrismaClient()

app.use(express.json())

app.post('/users', async (req, res) => {
  const { name, email } = req.body
  const user = await prisma.user.create({ data: { name, email } })
  res.json(user)
})

app.get('/users', async (_req, res) => {
  const users = await prisma.user.findMany()
  res.json(users)
})

app.listen(3005, () => console.log('Users service running on port 3005'))
