FROM node:20

WORKDIR /app

# Copia apenas o package.json e package-lock
COPY package*.json ./

# Instala dependências
RUN npm install

# Copia o restante do código (src, prisma, etc)
COPY . .

# Gera o Prisma Client
RUN npx prisma generate

# Expõe a porta correta
EXPOSE 3007

# Comando de inicialização
CMD ["node", "src/index.js"]

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3003
CMD sh -c "npx prisma generate && node src/index.js"
