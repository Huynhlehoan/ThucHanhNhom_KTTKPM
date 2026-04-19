# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Chuyển biến môi trường vào build-time cho Vite
ARG VITE_GATEWAY_URL
ENV VITE_GATEWAY_URL=$VITE_GATEWAY_URL
# Ép Vite build ra thư mục /app/dist bất kể package.json nói gì
RUN npx vite build --outDir dist

# Stage 2: Serve
FROM nginx:stable-alpine
COPY --from=build /app/dist /usr/share/nginx/html
# Copy config nginx nếu cần (ở đây dùng mặc định port 80)
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
