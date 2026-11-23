// security.js — заголовки безпеки, автентифікація адміністратора, обмеження частоти запитів.
'use strict';

const crypto = require('node:crypto');

function securityHeaders(req, res, next) {
  res.setHeader('Content-Security-Policy',
    "default-src 'self'; img-src 'self' data:; style-src 'self'; script-src 'self'; " +
    "connect-src 'self'; form-action 'self'; frame-ancestors 'none'; base-uri 'self'; object-src 'none'");
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
}

// Доступ до адмін-маршрутів — за токеном із змінної середовища ADMIN_TOKEN.
// Порівняння в постійному часі (timingSafeEqual), щоб не можна було підібрати токен за часом відповіді.
function requireAdmin(req, res, next) {
  const expected = process.env.ADMIN_TOKEN;
  if (!expected || expected.length < 16) {
    return res.status(503).json({ error: 'Адмін-панель вимкнена: не задано ADMIN_TOKEN (мінімум 16 символів).' });
  }
  const header = req.get('authorization') || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : '';
  const a = crypto.createHash('sha256').update(token).digest();
  const b = crypto.createHash('sha256').update(expected).digest();
  if (!token || !crypto.timingSafeEqual(a, b)) {
    return res.status(401).json({ error: 'Невірний токен доступу.' });
  }
  next();
}

// Простий обмежувач частоти запитів у пам'яті (для одного екземпляра сервера)
function rateLimit({ windowMs, max }) {
  const hits = new Map();
  return function (req, res, next) {
    const now = Date.now();
    const key = req.ip || 'unknown';
    const entry = hits.get(key);
    if (!entry || now - entry.start > windowMs) {
      hits.set(key, { start: now, count: 1 });
      return next();
    }
    entry.count += 1;
    if (entry.count > max) {
      res.setHeader('Retry-After', String(Math.ceil((entry.start + windowMs - now) / 1000)));
      return res.status(429).json({ error: 'form.err.rate' });
    }
    next();
  };
}

module.exports = { securityHeaders, requireAdmin, rateLimit };
