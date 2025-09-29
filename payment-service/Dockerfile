FROM node:20

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 3003
CMD sh -c "npx prisma generate && node src/index.js"
