/* i18n.js — перемикач мови UA/EN.
   Змінює текст усіх елементів з атрибутом data-i18n без перезавантаження сторінки. */
'use strict';

window.App = window.App || {};

App.i18n = (function () {
  const STORAGE_KEY = 'portfolio-lang';
  const dict = window.PORTFOLIO.i18n;
  let current = 'uk';

  // localStorage може бути недоступним (приватний режим), тому обгортаємо в try/catch
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && dict[saved]) current = saved;
  } catch (e) { /* залишаємо мову за замовчуванням */ }

  function t(key) {
    return (dict[current] && dict[current][key]) || dict.uk[key] || key;
  }

  function apply() {
    document.documentElement.lang = current;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      el.textContent = t(el.dataset.i18n);
    });
    document.querySelectorAll('[data-i18n-label]').forEach(function (el) {
      el.setAttribute('aria-label', t(el.dataset.i18nLabel));
    });
    document.querySelectorAll('.lang-switch button').forEach(function (btn) {
      const active = btn.dataset.lang === current;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', String(active));
    });
  }

  function setLang(lang) {
    if (!dict[lang] || lang === current) return;
    current = lang;
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) { /* ігноруємо */ }
    apply();
    // повідомляємо інші модулі (картки проєктів, форма), що мова змінилася
    document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: lang } }));
  }

  function init() {
    const switcher = document.querySelector('.lang-switch');
    if (switcher) {
      // делегування: один обробник на контейнер замість обробника на кожну кнопку
      switcher.addEventListener('click', function (event) {
        const btn = event.target.closest('button[data-lang]');
        if (btn) setLang(btn.dataset.lang);
      });
    }
    apply();
  }

  return { t: t, setLang: setLang, getLang: function () { return current; }, init: init };
})();
