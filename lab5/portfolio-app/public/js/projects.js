/* projects.js — динамічний вміст: картки проєктів, фільтр за технологією,
   сторінка окремого проєкту (project.html?id=...).
   ЛР5: дані завантажуються з REST API; якщо сервер недоступний — з локального data.js. */
'use strict';

window.App = window.App || {};

App.projects = (function () {
  let data = window.PORTFOLIO.projects;
  let offline = false;
  let activeFilter = 'all';

  // допоміжна функція створення елемента; текст додаємо через textContent (без innerHTML)
  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function tagList(tags) {
    const ul = el('ul', 'tag-list');
    tags.forEach(function (tag) { ul.appendChild(el('li', 'tag', tag)); });
    return ul;
  }

  function createCard(project) {
    const lang = App.i18n.getLang();
    const card = el('article', 'card is-appearing');

    const cover = el('div', 'card__cover', project.cover);
    cover.setAttribute('aria-hidden', 'true');

    const body = el('div', 'card__body');
    body.appendChild(el('h3', 'card__title', project.title));
    body.appendChild(el('p', 'card__text', project.description[lang]));
    body.appendChild(tagList(project.tags));
    body.appendChild(el('p', 'card__role', App.i18n.t('card.role') + ' ' + project.role[lang].toLowerCase()));

    const actions = el('div', 'card__actions');
    const gh = el('a', 'btn btn--outline btn--small', 'GitHub ↗');
    gh.href = project.github;
    gh.target = '_blank';
    gh.rel = 'noopener noreferrer';
    const more = el('a', 'btn btn--ghost btn--small', App.i18n.t('btn.details'));
    more.href = 'project.html?id=' + encodeURIComponent(project.id);
    actions.append(gh, more);
    body.appendChild(actions);

    card.append(cover, body);
    return card;
  }

  function renderInto(container, list) {
    container.replaceChildren();
    if (list.length === 0) {
      container.appendChild(el('p', 'empty-state', App.i18n.t('projects.empty')));
      return;
    }
    list.forEach(function (p) { container.appendChild(createCard(p)); });
  }

  function filtered() {
    if (activeFilter === 'all') return data;
    return data.filter(function (p) { return p.tags.indexOf(activeFilter) !== -1; });
  }

  // список фільтрів береться з даних (порядок як у прототипі)
  function renderChips(chips) {
    chips.replaceChildren();
    window.PORTFOLIO.filters.forEach(function (tag) {
      const li = el('li');
      const btn = el('button', 'chip' + (tag === activeFilter ? ' chip--active' : ''),
        tag === 'all' ? App.i18n.t('projects.all') : tag);
      btn.type = 'button';
      btn.dataset.filter = tag;
      btn.setAttribute('aria-pressed', String(tag === activeFilter));
      li.appendChild(btn);
      chips.appendChild(li);
    });
  }

  function updateList() {
    const grid = document.getElementById('projects-grid');
    const counter = document.getElementById('projects-count');
    const list = filtered();
    renderInto(grid, list);
    counter.textContent = App.i18n.t('projects.found') + ' ' + list.length;
  }

  function initList() {
    const chips = document.getElementById('project-filters');
    if (!chips) return;

    // фільтр можна передати в адресі: projects.html?tag=Docker
    const fromUrl = new URLSearchParams(location.search).get('tag');
    if (fromUrl && window.PORTFOLIO.filters.indexOf(fromUrl) !== -1) activeFilter = fromUrl;

    renderChips(chips);
    updateList();

    // делегування: один обробник на весь список фільтрів
    chips.addEventListener('click', function (event) {
      const btn = event.target.closest('button[data-filter]');
      if (!btn || btn.dataset.filter === activeFilter) return;
      activeFilter = btn.dataset.filter;
      chips.querySelectorAll('button[data-filter]').forEach(function (b) {
        const on = b === btn;
        b.classList.toggle('chip--active', on);
        b.setAttribute('aria-pressed', String(on));
      });
      const url = new URL(location.href);
      if (activeFilter === 'all') url.searchParams.delete('tag'); else url.searchParams.set('tag', activeFilter);
      history.replaceState(null, '', url);
      updateList();
    });

    document.addEventListener('langchange', function () {
      renderChips(chips);
      updateList();
    });
  }

  function initFeatured() {
    const grid = document.getElementById('featured-grid');
    if (!grid) return;
    const draw = function () {
      renderInto(grid, data.filter(function (p) { return p.featured; }));
    };
    draw();
    document.addEventListener('langchange', draw);
  }

  function initDetail() {
    const root = document.getElementById('project-detail');
    if (!root) return;
    const id = new URLSearchParams(location.search).get('id');
    const project = data.find(function (p) { return p.id === id; }) || data[0];

    const draw = function () {
      const lang = App.i18n.getLang();
      root.querySelector('[data-field="title"]').textContent = project.title;
      root.querySelector('[data-field="cover"]').textContent = project.cover;
      const tags = tagList(project.tags);
      tags.dataset.field = 'tags';
      root.querySelector('[data-field="tags"]').replaceWith(tags);
      ['task', 'solution', 'result', 'role', 'term', 'type'].forEach(function (key) {
        root.querySelector('[data-field="' + key + '"]').textContent = project[key][lang];
      });
      root.querySelector('[data-field="github"]').href = project.github;
      document.title = project.title + ' — Андрій Джунківський';
    };
    draw();
    document.addEventListener('langchange', draw);
  }

  // завантаження списку проєктів із сервера (async/await)
  async function load() {
    if (!App.api || !App.api.available) return;
    try {
      data = await App.api.getProjects();
    } catch (err) {
      offline = true;
      console.warn('API недоступний, використовуються локальні дані:', err.message);
    }
  }

  function showOfflineNote() {
    const counter = document.getElementById('projects-count');
    if (offline && counter) {
      const note = el('p', 'found', App.i18n.t('projects.offline'));
      note.dataset.i18n = 'projects.offline';
      counter.after(note);
    }
  }

  return {
    init: async function () {
      const grids = document.querySelectorAll('#projects-grid, #featured-grid');
      grids.forEach(function (g) { g.setAttribute('aria-busy', 'true'); });
      await load();
      grids.forEach(function (g) { g.removeAttribute('aria-busy'); });
      initList(); initFeatured(); initDetail(); showOfflineNote();
    },
    createCard: createCard
  };
})();
