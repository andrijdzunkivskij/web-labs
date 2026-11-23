// app.js — збирання Express-застосунку (окремо від запуску, щоб його можна було тестувати).
'use strict';

const path = require('node:path');
const express = require('express');
const db = require('./db');
const { securityHeaders } = require('./middleware/security');
const projectsRouter = require('./routes/projects');
const messagesRouter = require('./routes/messages');

function createApp(options = {}) {
  const database = db.open(options.dbPath || process.env.DB_PATH || path.join(__dirname, '..', 'data', 'portfolio.db'));
  const projects = db.createProjectRepo(database);
  const messages = db.createMessageRepo(database);

  const app = express();
  app.disable('x-powered-by');
  app.set('trust proxy', 1); // за проксі платформи (Render) req.ip містить справжню IP-адресу клієнта
  app.use(securityHeaders);
  app.use(express.json({ limit: '20kb' }));

  app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }));
  app.use('/api/projects', projectsRouter(projects));
  app.use('/api/messages', messagesRouter(messages, options));
  app.use('/api', (req, res) => res.status(404).json({ error: 'Маршрут не знайдено.' }));

  app.use(express.static(path.join(__dirname, '..', 'public'), { extensions: ['html'], maxAge: '1h' }));

  // обробник помилок: клієнту — коротке повідомлення без стеку, у лог — подробиці
  app.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    if (err.type === 'entity.parse.failed') return res.status(400).json({ error: 'Некоректний JSON.' });
    if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Занадто великий запит.' });
    console.error(err);
    res.status(500).json({ error: 'Внутрішня помилка сервера.' });
  });

  app.locals.db = database;
  return app;
}

module.exports = { createApp };
