/* main.js — навігація та загальні компоненти:
   бургер-меню, тінь шапки під час прокрутки, кнопка «Нагору». */
'use strict';

window.App = window.App || {};

App.nav = (function () {
  let burger, nav;

  function setOpen(open) {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
  }

  function init() {
    burger = document.querySelector('.burger');
    nav = document.getElementById('main-nav');
    if (!burger || !nav) return;

    burger.addEventListener('click', function () {
      setOpen(burger.getAttribute('aria-expanded') !== 'true');
    });

    // закриваємо меню після вибору пункту (делегування подій на <nav>)
    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    // Escape закриває меню і повертає фокус на кнопку
    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && nav.classList.contains('is-open')) {
        setOpen(false);
        burger.focus();
      }
    });

    // якщо екран розширили до десктопа — скидаємо стан меню
    window.matchMedia('(min-width: 768px)').addEventListener('change', function (mq) {
      if (mq.matches) setOpen(false);
    });
  }

  return { init: init };
})();

App.scroll = (function () {
  function init() {
    const header = document.querySelector('.site-header');

    // кнопку «Нагору» створюємо динамічно, вона потрібна лише за наявності JS
    const topBtn = document.createElement('button');
    topBtn.type = 'button';
    topBtn.className = 'back-to-top';
    topBtn.textContent = '↑';
    topBtn.dataset.i18nLabel = 'btn.top';
    topBtn.setAttribute('aria-label', App.i18n.t('btn.top'));
    document.body.appendChild(topBtn);

    topBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    let ticking = false;
    function update() {
      const y = window.scrollY;
      if (header) header.classList.toggle('is-scrolled', y > 10);
      topBtn.classList.toggle('is-visible', y > 400);
      ticking = false;
    }

    // оптимізація: оновлюємо не частіше ніж раз на кадр
    window.addEventListener('scroll', function () {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }, { passive: true });
    update();
  }

  return { init: init };
})();

document.addEventListener('DOMContentLoaded', function () {
  App.i18n.init();
  App.nav.init();
  App.scroll.init();
  if (App.projects) App.projects.init();
  if (App.form) App.form.init();
});
