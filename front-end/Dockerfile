# 1단계: 빌드
FROM node:18-alpine as builder
WORKDIR /app

# ✅ .env 파일 포함
COPY .env .env
COPY package.json package-lock.json ./
RUN npm install

COPY . .
RUN npm run build

# 2단계: 정적 서버로 배포
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
