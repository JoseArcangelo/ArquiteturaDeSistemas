FROM node:20-alpine

WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia todo o restante da aplicação
COPY . .

# Gera o Prisma Client
RUN npx prisma generate

# Porta correta do Orders Service
EXPOSE 3002

# Comando para rodar o serviço
CMD ["node", "src/index.js"]
