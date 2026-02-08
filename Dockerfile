FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --ignore-scripts
COPY . .
RUN npm run build

FROM node:20-alpine AS production
WORKDIR /app
COPY --chown=node:node package*.json ./
RUN npm ci --only=production --ignore-scripts
COPY --from=builder --chown=node:node /app/dist ./dist
COPY --chown=node:node migrate.js seed.js ./
COPY --from=builder --chown=node:node /app/migrations ./migrations
USER node
CMD ["sh", "-c", "node migrate.js && node dist/index.js"]