// routes/projects.js — REST API для проєктів (CRUD).
'use strict';

const express = require('express');
const { validateProject } = require('../validators');
const { requireAdmin } = require('../middleware/security');

module.exports = function projectsRouter(repo) {
  const router = express.Router();

  // READ: список проєктів, необов'язковий фільтр ?tag=Docker
  router.get('/', (req, res) => {
    const tag = typeof req.query.tag === 'string' ? req.query.tag : '';
    res.json(repo.list(tag));
  });

  // READ: один проєкт за slug
  router.get('/:slug', (req, res) => {
    const project = repo.get(req.params.slug);
    if (!project) return res.status(404).json({ error: 'Проєкт не знайдено.' });
    res.json(project);
  });

  // CREATE
  router.post('/', requireAdmin, (req, res) => {
    const { data, errors } = validateProject(req.body || {});
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Помилка валідації.', fields: errors });
    if (repo.get(data.id)) return res.status(409).json({ error: 'Проєкт з таким slug уже існує.', fields: { id: 'Slug зайнятий.' } });
    if (data.sortOrder === null) data.sortOrder = repo.list().length; // новий проєкт — у кінець списку
    res.status(201).json(repo.create(data));
  });

  // UPDATE (повна заміна)
  router.put('/:slug', requireAdmin, (req, res) => {
    if (!repo.get(req.params.slug)) return res.status(404).json({ error: 'Проєкт не знайдено.' });
    const { data, errors } = validateProject(req.body || {});
    if (Object.keys(errors).length) return res.status(400).json({ error: 'Помилка валідації.', fields: errors });
    if (data.id !== req.params.slug && repo.get(data.id)) {
      return res.status(409).json({ error: 'Проєкт з таким slug уже існує.', fields: { id: 'Slug зайнятий.' } });
    }
    if (data.sortOrder === null) data.sortOrder = repo.get(req.params.slug).sortOrder;
    res.json(repo.update(req.params.slug, data));
  });

  // DELETE
  router.delete('/:slug', requireAdmin, (req, res) => {
    if (!repo.remove(req.params.slug)) return res.status(404).json({ error: 'Проєкт не знайдено.' });
    res.status(204).end();
  });

  return router;
};
