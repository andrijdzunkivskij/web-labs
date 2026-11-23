// db.js — підключення до SQLite, створення таблиць і початкове наповнення.
// Використовується вбудований модуль node:sqlite (Node.js 22.13+), без нативних залежностей.
'use strict';

const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { DatabaseSync } = require('node:sqlite');

const I18N_FIELDS = ['description', 'role', 'term', 'type', 'task', 'solution', 'result'];

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS projects (
    id            INTEGER PRIMARY KEY AUTOINCREMENT,
    slug          TEXT NOT NULL UNIQUE,
    title         TEXT NOT NULL,
    cover         TEXT NOT NULL DEFAULT '',
    tags          TEXT NOT NULL DEFAULT '',
    github        TEXT NOT NULL DEFAULT '',
    featured      INTEGER NOT NULL DEFAULT 0 CHECK (featured IN (0, 1)),
    sort_order    INTEGER NOT NULL DEFAULT 0,
    ${I18N_FIELDS.map((f) => `${f}_uk TEXT NOT NULL DEFAULT '', ${f}_en TEXT NOT NULL DEFAULT ''`).join(',\n    ')},
    created_at    TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at    TEXT NOT NULL DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS messages (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        TEXT NOT NULL,
    email       TEXT NOT NULL,
    message     TEXT NOT NULL,
    is_read     INTEGER NOT NULL DEFAULT 0 CHECK (is_read IN (0, 1)),
    created_at  TEXT NOT NULL DEFAULT (datetime('now'))
  );
`;

// Початкові дані беремо з клієнтського файлу public/js/data.js, щоб не дублювати їх
function loadSeedProjects() {
  const file = path.join(__dirname, '..', 'public', 'js', 'data.js');
  const sandbox = { window: {} };
  vm.runInNewContext(fs.readFileSync(file, 'utf8'), sandbox);
  return sandbox.window.PORTFOLIO.projects;
}

// Перетворення між рядком таблиці та об'єктом API
function rowToProject(row) {
  const p = {
    id: row.slug,
    dbId: row.id,
    title: row.title,
    cover: row.cover,
    tags: row.tags ? row.tags.split(',') : [],
    github: row.github,
    featured: row.featured === 1,
    sortOrder: row.sort_order,
    updatedAt: row.updated_at
  };
  I18N_FIELDS.forEach((f) => { p[f] = { uk: row[`${f}_uk`], en: row[`${f}_en`] }; });
  return p;
}

function projectToParams(p) {
  const params = {
    slug: p.id,
    title: p.title,
    cover: p.cover || '',
    tags: (p.tags || []).join(','),
    github: p.github || '',
    featured: p.featured ? 1 : 0,
    sort_order: Number.isInteger(p.sortOrder) ? p.sortOrder : 0
  };
  I18N_FIELDS.forEach((f) => {
    params[`${f}_uk`] = (p[f] && p[f].uk) || '';
    params[`${f}_en`] = (p[f] && p[f].en) || '';
  });
  return params;
}

function open(dbPath) {
  if (dbPath !== ':memory:') fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });
  const db = new DatabaseSync(dbPath);
  db.exec('PRAGMA foreign_keys = ON; PRAGMA journal_mode = WAL;');
  db.exec(SCHEMA);

  const count = db.prepare('SELECT COUNT(*) AS n FROM projects').get().n;
  if (count === 0) {
    const repo = createProjectRepo(db);
    loadSeedProjects().forEach((p, i) => repo.create({ ...p, sortOrder: i }));
  }
  return db;
}

// Репозиторій проєктів: усі запити параметризовані (захист від SQL-ін'єкцій)
function createProjectRepo(db) {
  const cols = ['slug', 'title', 'cover', 'tags', 'github', 'featured', 'sort_order',
    ...I18N_FIELDS.flatMap((f) => [`${f}_uk`, `${f}_en`])];

  const stmts = {
    list: db.prepare('SELECT * FROM projects ORDER BY sort_order, id'),
    get: db.prepare('SELECT * FROM projects WHERE slug = ?'),
    insert: db.prepare(`INSERT INTO projects (${cols.join(', ')}) VALUES (${cols.map((c) => ':' + c).join(', ')})`),
    update: db.prepare(`UPDATE projects SET ${cols.map((c) => `${c} = :${c}`).join(', ')}, updated_at = datetime('now') WHERE slug = :old_slug`),
    remove: db.prepare('DELETE FROM projects WHERE slug = ?')
  };

  return {
    list(tag) {
      const all = stmts.list.all().map(rowToProject);
      return tag ? all.filter((p) => p.tags.includes(tag)) : all;
    },
    get(slug) {
      const row = stmts.get.get(slug);
      return row ? rowToProject(row) : null;
    },
    create(p) {
      stmts.insert.run(projectToParams(p));
      return this.get(p.id);
    },
    update(oldSlug, p) {
      const res = stmts.update.run({ ...projectToParams(p), old_slug: oldSlug });
      return res.changes ? this.get(p.id) : null;
    },
    remove(slug) {
      return stmts.remove.run(slug).changes > 0;
    }
  };
}

function createMessageRepo(db) {
  const stmts = {
    list: db.prepare('SELECT * FROM messages ORDER BY created_at DESC, id DESC'),
    insert: db.prepare('INSERT INTO messages (name, email, message) VALUES (?, ?, ?)'),
    get: db.prepare('SELECT * FROM messages WHERE id = ?'),
    setRead: db.prepare('UPDATE messages SET is_read = ? WHERE id = ?'),
    remove: db.prepare('DELETE FROM messages WHERE id = ?')
  };
  const map = (r) => ({ id: r.id, name: r.name, email: r.email, message: r.message, isRead: r.is_read === 1, createdAt: r.created_at });

  return {
    list: () => stmts.list.all().map(map),
    create(m) {
      const res = stmts.insert.run(m.name, m.email, m.message);
      return map(stmts.get.get(res.lastInsertRowid));
    },
    setRead(id, isRead) {
      const res = stmts.setRead.run(isRead ? 1 : 0, id);
      return res.changes ? map(stmts.get.get(id)) : null;
    },
    remove: (id) => stmts.remove.run(id).changes > 0
  };
}

module.exports = { open, createProjectRepo, createMessageRepo, I18N_FIELDS };
