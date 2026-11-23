// validators.js — перевірка вхідних даних на сервері.
// Сервер не довіряє клієнтській валідації: усі правила повторюються тут.
// Коди помилок збігаються з ключами перекладів на клієнті (form.err.*).
'use strict';

const { I18N_FIELDS } = require('./db');

const NAME_RE = /^[A-Za-zА-Яа-яІіЇїЄєҐґ' -]{2,50}$/;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const TAG_RE = /^[\p{L}\p{N} #+./-]{1,20}$/u;

const str = (v) => (typeof v === 'string' ? v.trim() : '');

function validateMessage(body) {
  const data = {
    name: str(body.name),
    email: str(body.email).toLowerCase(),
    message: str(body.message)
  };
  const errors = {};
  if (!data.name) errors.name = 'form.err.required';
  else if (!NAME_RE.test(data.name)) errors.name = 'form.err.name';
  if (!data.email) errors.email = 'form.err.required';
  else if (data.email.length > 100 || !EMAIL_RE.test(data.email)) errors.email = 'form.err.email';
  if (!data.message) errors.message = 'form.err.required';
  else if (data.message.length < 10) errors.message = 'form.err.messageShort';
  else if (data.message.length > 1000) errors.message = 'form.err.messageLong';
  return { data, errors };
}

function isSafeUrl(value) {
  if (!value) return true;
  try {
    const u = new URL(value);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch (e) {
    return false;
  }
}

function validateProject(body) {
  const errors = {};
  const tags = Array.isArray(body.tags) ? body.tags.map(str).filter(Boolean)
    : str(body.tags).split(',').map((t) => t.trim()).filter(Boolean);

  const data = {
    id: str(body.id).toLowerCase(),
    title: str(body.title),
    cover: str(body.cover),
    tags: [...new Set(tags)],
    github: str(body.github),
    featured: body.featured === true || body.featured === 'true' || body.featured === 1,
    sortOrder: Number.isInteger(body.sortOrder) ? body.sortOrder : null
  };

  if (!SLUG_RE.test(data.id) || data.id.length > 60) errors.id = 'Slug: лише малі латинські літери, цифри та дефіс (до 60 символів).';
  if (data.title.length < 2 || data.title.length > 80) errors.title = 'Назва: від 2 до 80 символів.';
  if (data.cover.length > 5) errors.cover = 'Обкладинка: до 5 символів.';
  if (data.tags.length === 0 || data.tags.length > 8) errors.tags = 'Теги: від 1 до 8 через кому.';
  else if (!data.tags.every((t) => TAG_RE.test(t))) errors.tags = 'Тег: до 20 символів, без спеціальних знаків.';
  if (!isSafeUrl(data.github)) errors.github = 'Посилання має починатися з http:// або https://.';

  I18N_FIELDS.forEach((f) => {
    const src = body[f] || {};
    data[f] = { uk: str(src.uk), en: str(src.en) };
    ['uk', 'en'].forEach((lang) => {
      if (data[f][lang].length > 1000) errors[`${f}.${lang}`] = 'Текст до 1000 символів.';
    });
  });
  if (!data.description.uk) errors['description.uk'] = 'Опис українською обов\'язковий.';

  return { data, errors };
}

module.exports = { validateMessage, validateProject };
