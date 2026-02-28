FROM node:18-alpine

WORKDIR /app

# Copier package.json
COPY package*.json ./

RUN npm install

# Copier tout le contenu de app_admin
COPY . .

EXPOSE 3000

CMD ["node", "server.js"]