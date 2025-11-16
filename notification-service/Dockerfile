FROM node:18-alpine
WORKDIR /app
<<<<<<< HEAD

COPY package.json .
RUN npm install --production

COPY src ./src

EXPOSE 3005
CMD ["node", "src/index.js"]
=======
COPY package.json .
RUN npm install --production
COPY src ./src
EXPOSE 3005
CMD ["node", "src/index.js"]
>>>>>>> b42d51ac57dd4e001d1535ce2e380eeb79442aac
