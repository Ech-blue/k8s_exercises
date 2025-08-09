FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY backend.js ./
CMD ["node", "backend.js"]

