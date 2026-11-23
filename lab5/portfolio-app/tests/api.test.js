// api.test.js — автоматичні тести REST API (вбудований модуль node:test, запуск: npm test).
'use strict';

const { test, before, after } = require('node:test');
const assert = require('node:assert/strict');
const { createApp } = require('../server/app');

const TOKEN = 'test-admin-token-1234567890';
let server;
let base;

before(async () => {
  process.env.ADMIN_TOKEN = TOKEN;
  const app = createApp({ dbPath: ':memory:', rateMax: 3, rateWindowMs: 60000 });
  await new Promise((resolve) => { server = app.listen(0, resolve); });
  base = 'http://127.0.0.1:' + server.address().port;
});

after(() => server.close());

const call = (path, { method = 'GET', body, token } = {}) => fetch(base + path, {
  method,
  headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
  body: body === undefined ? undefined : (typeof body === 'string' ? body : JSON.stringify(body))
});

const newProject = {
  id: 'test-project', title: 'Test Project', cover: 'T', tags: 'Node.js, Express',
  github: 'https://github.com/test', featured: false,
  description: { uk: 'Тестовий опис', en: 'Test description' }
};

test('GET /api/health повертає статус ok', async () => {
  const res = await call('/api/health');
  assert.equal(res.status, 200);
  assert.equal((await res.json()).status, 'ok');
});

test('READ: список містить 6 початкових проєктів', async () => {
  const list = await (await call('/api/projects')).json();
  assert.equal(list.length, 6);
  assert.equal(list[0].id, 'task-tracker-api');
  assert.deepEqual(Object.keys(list[0].description), ['uk', 'en']);
});

test('READ: фільтр ?tag=Docker повертає 3 проєкти', async () => {
  const list = await (await call('/api/projects?tag=Docker')).json();
  assert.equal(list.length, 3);
});

test('READ: неіснуючий проєкт — 404', async () => {
  assert.equal((await call('/api/projects/nope')).status, 404);
});

test('CREATE без токена — 401, з неправильним токеном — 401', async () => {
  assert.equal((await call('/api/projects', { method: 'POST', body: newProject })).status, 401);
  assert.equal((await call('/api/projects', { method: 'POST', body: newProject, token: 'wrong' })).status, 401);
});

test('CREATE з некоректними даними — 400 з помилками полів', async () => {
  const res = await call('/api/projects', { method: 'POST', token: TOKEN, body: { id: 'Bad Slug!', title: 'x', tags: '', github: 'javascript:alert(1)' } });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.ok(data.fields.id && data.fields.title && data.fields.tags && data.fields.github);
});

test('CREATE → READ → UPDATE → DELETE', async () => {
  let res = await call('/api/projects', { method: 'POST', token: TOKEN, body: newProject });
  assert.equal(res.status, 201);
  assert.deepEqual((await res.json()).tags, ['Node.js', 'Express']);

  res = await call('/api/projects', { method: 'POST', token: TOKEN, body: newProject });
  assert.equal(res.status, 409, 'повторний slug відхиляється');

  res = await call('/api/projects/test-project', { method: 'PUT', token: TOKEN, body: { ...newProject, title: 'Updated', featured: true } });
  assert.equal(res.status, 200);
  const upd = await res.json();
  assert.equal(upd.title, 'Updated');
  assert.equal(upd.featured, true);

  res = await call('/api/projects/test-project', { method: 'DELETE', token: TOKEN });
  assert.equal(res.status, 204);
  assert.equal((await call('/api/projects/test-project')).status, 404);
});

test('Безпека: SQL-ін\'єкція в параметрі не виконується', async () => {
  const res = await call("/api/projects/x'%20OR%20'1'='1");
  assert.equal(res.status, 404);
  const list = await (await call("/api/projects?tag=' OR 1=1 --")).json();
  assert.equal(list.length, 0);
});

test('Безпека: заголовки захисту присутні, X-Powered-By відсутній', async () => {
  const res = await call('/api/health');
  assert.match(res.headers.get('content-security-policy'), /default-src 'self'/);
  assert.equal(res.headers.get('x-content-type-options'), 'nosniff');
  assert.equal(res.headers.get('x-frame-options'), 'DENY');
  assert.equal(res.headers.get('x-powered-by'), null);
});

test('Безпека: некоректний JSON — 400 без стеку помилки', async () => {
  const res = await call('/api/messages', { method: 'POST', body: '{bad json' });
  assert.equal(res.status, 400);
  const text = await res.text();
  assert.ok(!text.includes('at '), 'стек не розкривається');
});

test('Повідомлення: валідація на сервері', async () => {
  const res = await call('/api/messages', { method: 'POST', body: { name: 'A', email: 'bad', message: 'short' } });
  assert.equal(res.status, 400);
  const data = await res.json();
  assert.deepEqual(data.fields, { name: 'form.err.name', email: 'form.err.email', message: 'form.err.messageShort' });
});

test('Повідомлення: XSS-рядок зберігається як текст; список доступний лише адміну', async () => {
  const xss = '<img src=x onerror=alert(1)> тест повідомлення';
  const res = await call('/api/messages', { method: 'POST', body: { name: 'Андрій', email: 'a@example.com', message: xss } });
  assert.equal(res.status, 201);
  assert.equal((await call('/api/messages')).status, 401);
  const list = await (await call('/api/messages', { token: TOKEN })).json();
  assert.equal(list[0].message, xss);
  assert.equal(list[0].isRead, false);

  const id = list[0].id;
  const patched = await (await call('/api/messages/' + id, { method: 'PATCH', token: TOKEN, body: { isRead: true } })).json();
  assert.equal(patched.isRead, true);
  assert.equal((await call('/api/messages/' + id, { method: 'DELETE', token: TOKEN })).status, 204);
});

test('Повідомлення: поле-пастка website — бот отримує 201, але нічого не зберігається', async () => {
  const before = (await (await call('/api/messages', { token: TOKEN })).json()).length;
  const res = await call('/api/messages', { method: 'POST', body: { name: 'Bot', email: 'b@b.com', message: 'buy cheap stuff now', website: 'spam.com' } });
  assert.equal(res.status, 201);
  const afterCount = (await (await call('/api/messages', { token: TOKEN })).json()).length;
  assert.equal(afterCount, before);
});

test('Повідомлення: обмеження частоти — 429 після ліміту', async () => {
  let last;
  for (let i = 0; i < 4; i++) {
    last = await call('/api/messages', { method: 'POST', body: { name: 'Тест', email: 't@example.com', message: 'Повідомлення номер ' + i } });
  }
  assert.equal(last.status, 429);
  assert.equal((await last.json()).error, 'form.err.rate');
});

test('Невідомий маршрут API — 404 у форматі JSON', async () => {
  const res = await call('/api/unknown');
  assert.equal(res.status, 404);
  assert.ok((await res.json()).error);
});
