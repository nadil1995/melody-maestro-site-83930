FROM node:18-alpine AS builder
WORKDIR /app

# Copy package files
COPY package*.json ./

RUN npm install

# Copy all source files
COPY . .

RUN npm run build

# --- Production image ---
FROM nginx:alpine

# Copy built files
COPY --from=builder /app/dist /usr/share/nginx/html

# Copy custom nginx configuration for SPA routing
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Remove default nginx config
RUN rm -f /etc/nginx/conf.d/default.conf.default

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
