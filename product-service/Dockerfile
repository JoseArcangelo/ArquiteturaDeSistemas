FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY src ./src

EXPOSE 3004

# Rodar prisma generate na inicialização
CMD ["sh", "-c", "npx prisma generate && node src/index.js"]
