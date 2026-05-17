# =========================
# Stage 1: Build React app
# =========================
FROM node:20-alpine AS build

WORKDIR /app

# Nhận biến môi trường API URL lúc build
ARG REACT_APP_API_BASE_URL
ENV REACT_APP_API_BASE_URL=${REACT_APP_API_BASE_URL}

# Cài dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy source code
COPY . .

# Build frontend
RUN npm run build


# =========================
# Stage 2: Serve with Nginx
# =========================
FROM nginx:alpine

# Thiết lập timezone Việt Nam
ENV TZ=Asia/Ho_Chi_Minh
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Xóa config mặc định của Nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copy file build React sang Nginx
COPY --from=build /app/build /usr/share/nginx/html

# Copy nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]