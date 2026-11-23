/* api.js — взаємодія клієнта із сервером через Fetch API, Promise та async/await (ЛР5). */
'use strict';

window.App = window.App || {};

App.api = (function () {
  const TIMEOUT_MS = 8000;

  class ApiError extends Error {
    constructor(message, status, fields) {
      super(message);
      this.status = status;
      this.fields = fields || {};
    }
  }

  // універсальний запит: таймаут, розбір JSON, перетворення HTTP-помилок на винятки
  async function request(url, options = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        ...options,
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        signal: controller.signal
      });
      if (response.status === 204) return null;
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new ApiError(data.error || 'HTTP ' + response.status, response.status, data.fields);
      return data;
    } catch (err) {
      if (err instanceof ApiError) throw err;
      throw new ApiError('form.err.network', 0); // мережа недоступна або сервер не відповів
    } finally {
      clearTimeout(timer);
    }
  }

  // сайт відкрито як файл (file://) — сервера немає, працюємо на локальних даних
  const available = location.protocol === 'http:' || location.protocol === 'https:';

  return {
    ApiError: ApiError,
    available: available,
    request: request,
    getProjects: (tag) => request('/api/projects' + (tag ? '?tag=' + encodeURIComponent(tag) : '')),
    getProject: (slug) => request('/api/projects/' + encodeURIComponent(slug)),
    sendMessage: (payload) => request('/api/messages', { method: 'POST', body: JSON.stringify(payload) })
  };
})();

// Форма з ЛР4 тепер надсилає дані на сервер
if (App.form && App.api.available) {
  App.form.send = async function (payload) {
    try {
      return await App.api.sendMessage(payload);
    } catch (err) {
      // помилки окремих полів від сервера показуємо під відповідними полями
      Object.keys(err.fields).forEach(function (name) {
        const errorEl = document.getElementById(name + '-error');
        const input = document.getElementById(name);
        if (errorEl) { errorEl.textContent = App.i18n.t(err.fields[name]); errorEl.dataset.key = err.fields[name]; }
        if (input) input.classList.add('is-invalid');
      });
      throw new Error(App.i18n.t(err.message));
    }
  };
}
