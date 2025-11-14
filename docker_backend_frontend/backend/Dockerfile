# Stage 1: Development
FROM node:22-alpine as development

WORKDIR /app

# Копируем package files
COPY package*.json ./

# Устанавливаем ВСЕ зависимости (включая dev)
RUN npm install

# Копируем исходный код
COPY . .

EXPOSE 5000

# Команда для разработки
CMD ["npm", "run", "dev"]

# Stage 2: Production
FROM node:22-alpine as production

WORKDIR /app

# Создаем non-root пользователя для безопасности
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Копируем package files
COPY package*.json ./

# Устанавливаем ТОЛЬКО production зависимости
RUN npm ci --only=production --silent

# Копируем исходный код
COPY --chown=nodejs:nodejs . .

# Переключаемся на non-root пользователя
USER nodejs

EXPOSE 5000

# Запускаем приложение
CMD ["npm", "start"]