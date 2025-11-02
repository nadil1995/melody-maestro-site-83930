# build stage for react
FROM node:18-alpine AS builder
WORKDIR /app
COPY client/package.json client/package-lock.json ./client/
COPY client/ ./client/
RUN cd client && npm ci && npm run build

# server image
FROM node:18-alpine
WORKDIR /app
COPY server/package.json server/package-lock.json ./server/
COPY server/ ./server/
# copy built client
COPY --from=builder /app/client/build ./client/build
WORKDIR /app/server
RUN cd /app/server && npm ci --production
EXPOSE 8080
CMD ["node", "index.js"]
