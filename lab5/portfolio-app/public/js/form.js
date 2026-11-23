/* form.js — клієнтська валідація контактної форми та повідомлення про помилки. */
'use strict';

window.App = window.App || {};

App.form = (function () {
  const MAX_MESSAGE = 1000;

  // правила перевірки: кожна функція повертає ключ помилки або null
  const rules = {
    name: function (v) {
      if (!v) return 'form.err.required';
      return /^[A-Za-zА-Яа-яІіЇїЄєҐґ' -]{2,50}$/.test(v) ? null : 'form.err.name';
    },
    email: function (v) {
      if (!v) return 'form.err.required';
      return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? null : 'form.err.email';
    },
    message: function (v) {
      if (!v) return 'form.err.required';
      if (v.length < 10) return 'form.err.messageShort';
      if (v.length > MAX_MESSAGE) return 'form.err.messageLong';
      return null;
    },
    agree: function (v, field) {
      return field.checked ? null : 'form.err.agree';
    }
  };

  function validateField(field) {
    const rule = rules[field.name];
    if (!rule) return true;
    const errorKey = rule(field.value.trim(), field);
    const errorEl = document.getElementById(field.name + '-error');
    field.classList.toggle('is-invalid', Boolean(errorKey));
    field.setAttribute('aria-invalid', String(Boolean(errorKey)));
    if (errorEl) {
      errorEl.textContent = errorKey ? App.i18n.t(errorKey) : '';
      errorEl.dataset.key = errorKey || '';
    }
    return !errorKey;
  }

  function init() {
    const form = document.getElementById('contact-form');
    if (!form) return;
    const status = document.getElementById('form-status');
    const message = form.elements.message;
    const counter = document.getElementById('message-counter');
    const touched = new Set();

    function updateCounter() {
      counter.textContent = message.value.length + ' / ' + MAX_MESSAGE;
    }

    // перевіряємо поле, коли користувач з нього виходить
    form.addEventListener('focusout', function (event) {
      if (rules[event.target.name]) {
        touched.add(event.target.name);
        validateField(event.target);
      }
    });

    // після першої перевірки — оновлюємо помилку під час введення
    form.addEventListener('input', function (event) {
      if (event.target === message) updateCounter();
      if (touched.has(event.target.name)) validateField(event.target);
      status.className = 'form-status';
    });

    form.addEventListener('submit', function (event) {
      event.preventDefault();
      const fields = Array.from(form.elements).filter(function (f) { return rules[f.name]; });
      const results = fields.map(validateField);
      fields.forEach(function (f) { touched.add(f.name); });

      if (results.indexOf(false) !== -1) {
        status.textContent = App.i18n.t('form.err.summary');
        status.className = 'form-status is-error';
        form.querySelector('.is-invalid').focus();
        return;
      }

      const payload = {
        name: form.elements.name.value.trim(),
        email: form.elements.email.value.trim(),
        message: message.value.trim()
      };
      // приховане поле-пастка для ботів (ЛР5): людина його не бачить і не заповнює
      if (form.elements.website) payload.website = form.elements.website.value;
      App.form.send(payload).then(function () {
        status.textContent = App.i18n.t('form.success');
        status.className = 'form-status is-success';
        form.reset();
        touched.clear();
        updateCounter();
      }).catch(function (err) {
        status.textContent = err.message;
        status.className = 'form-status is-error';
      });
    });

    // при зміні мови перекладаємо вже показані помилки
    document.addEventListener('langchange', function () {
      form.querySelectorAll('.field-error').forEach(function (e) {
        if (e.dataset.key) e.textContent = App.i18n.t(e.dataset.key);
      });
      if (status.classList.contains('is-success')) status.textContent = App.i18n.t('form.success');
      if (status.classList.contains('is-error')) status.textContent = App.i18n.t('form.err.summary');
    });

    updateCounter();
  }

  // у ЛР4 сервера ще немає: імітуємо надсилання; у ЛР5 цю функцію замінено на fetch()
  function send(payload) {
    console.info('Форма пройшла перевірку, дані до надсилання:', payload);
    return new Promise(function (resolve) { setTimeout(resolve, 400); });
  }

  return { init: init, send: send, validateField: validateField };
})();
