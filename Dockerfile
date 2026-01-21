FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production --ignore-scripts
COPY --from=builder /app/dist ./dist
COPY migrate.js seed.js ./
COPY --from=builder /app/migrations ./migrations
EXPOSE 3000
CMD ["node", "dist/index.js"]