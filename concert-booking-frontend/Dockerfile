# Stage 1: Build stage
FROM node:20-alpine AS build
WORKDIR /app

# Accept build arguments and set environment variables
ARG REACT_APP_API_BASE_URL=/api
ENV REACT_APP_API_BASE_URL=$REACT_APP_API_BASE_URL

# 1. Cache dependencies
COPY package.json package-lock.json* ./
RUN npm install

# 2. Copy source code và build
COPY . .
RUN npm run build

# Stage 2: Runtime stage
FROM nginx:alpine

# Thiết lập múi giờ Việt Nam
ENV TZ=Asia/Ho_Chi_Minh
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Copy file build từ stage build sang
COPY --from=build /app/build /usr/share/nginx/html

# Copy cấu hình nginx tùy chỉnh
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]