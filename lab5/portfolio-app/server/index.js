// index.js — точка входу: запуск сервера.
'use strict';

const { createApp } = require('./app');

const PORT = Number(process.env.PORT) || 3000;
const app = createApp();

app.listen(PORT, () => {
  console.log(`Сервер запущено: http://localhost:${PORT}`);
  if (!process.env.ADMIN_TOKEN) console.warn('ADMIN_TOKEN не задано — адмін-панель вимкнена.');
});
