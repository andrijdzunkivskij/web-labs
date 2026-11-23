// routes/messages.js — повідомлення з контактної форми.
'use strict';

const express = require('express');
const { validateMessage } = require('../validators');
const { requireAdmin, rateLimit } = require('../middleware/security');

module.exports = function messagesRouter(repo, options = {}) {
  const router = express.Router();
  const limiter = rateLimit({ windowMs: options.rateWindowMs || 10 * 60 * 1000, max: options.rateMax || 5 });

  // CREATE: публічний маршрут для форми; захист від спаму — ліміт запитів і приховане поле-пастка
  router.post('/', limiter, (req, res) => {
    const body = req.body || {};
    if (body.website) {
      // поле website заповнюють лише боти; відповідаємо «успіхом», але нічого не зберігаємо
      return res.status(201).json({ ok: true });
    }
    const { data, errors } = validateMessage(body);
    if (Object.keys(errors).length) return res.status(400).json({ error: 'form.err.summary', fields: errors });
    const saved = repo.create(data);
    res.status(201).json({ ok: true, id: saved.id });
  });

  // READ: список повідомлень (лише адміністратор)
  router.get('/', requireAdmin, (req, res) => res.json(repo.list()));

  // UPDATE: позначити прочитаним / непрочитаним
  router.patch('/:id', requireAdmin, (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || typeof (req.body || {}).isRead !== 'boolean') {
      return res.status(400).json({ error: 'Очікується { "isRead": true | false }.' });
    }
    const updated = repo.setRead(id, req.body.isRead);
    if (!updated) return res.status(404).json({ error: 'Повідомлення не знайдено.' });
    res.json(updated);
  });

  // DELETE
  router.delete('/:id', requireAdmin, (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(id) || !repo.remove(id)) return res.status(404).json({ error: 'Повідомлення не знайдено.' });
    res.status(204).end();
  });

  return router;
};
