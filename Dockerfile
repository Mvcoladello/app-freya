FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN apk add --no-cache curl

EXPOSE 3000

CMD ["npm", "start"]
