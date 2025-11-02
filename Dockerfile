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
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
