FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY prisma ./prisma
COPY src ./src

RUN npx prisma generate

EXPOSE 3003
CMD ["npm", "run", "dev"]
