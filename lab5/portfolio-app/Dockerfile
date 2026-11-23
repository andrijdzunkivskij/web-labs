# Образ для розгортання вебзастосунку
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm install --omit=dev && npm cache clean --force
COPY server ./server
COPY public ./public
# запуск від непривілейованого користувача
RUN mkdir -p /app/data && chown -R node:node /app/data
USER node
ENV PORT=3000 DB_PATH=/app/data/portfolio.db
EXPOSE 3000
CMD ["node", "--disable-warning=ExperimentalWarning", "server/index.js"]
