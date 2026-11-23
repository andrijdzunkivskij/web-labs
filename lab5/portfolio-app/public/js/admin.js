/* admin.js — адмін-панель: CRUD проєктів і робота з повідомленнями через REST API. */
'use strict';

(function () {
  const TOKEN_KEY = 'portfolio-admin-token';
  const I18N_FIELDS = [
    ['description', 'Опис'], ['role', 'Роль'], ['term', 'Термін'], ['type', 'Тип'],
    ['task', 'Задача'], ['solution', 'Рішення'], ['result', 'Результат']
  ];

  let token = '';
  let projects = [];
  let editingSlug = null;

  const $ = (id) => document.getElementById(id);

  function el(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function getStored() {
    try { return sessionStorage.getItem(TOKEN_KEY) || ''; } catch (e) { return ''; }
  }

  function store(value) {
    try {
      if (value) sessionStorage.setItem(TOKEN_KEY, value); else sessionStorage.removeItem(TOKEN_KEY);
    } catch (e) { /* сховище недоступне — токен живе лише в пам'яті */ }
  }

  // запит до API з токеном адміністратора
  async function api(url, options = {}) {
    const response = await fetch(url, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + token }
    });
    if (response.status === 204) return null;
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const err = new Error(data.error || 'HTTP ' + response.status);
      err.status = response.status;
      err.fields = data.fields || {};
      throw err;
    }
    return data;
  }

  function setStatus(node, text, type) {
    node.textContent = text;
    node.className = 'form-status' + (type ? ' is-' + type : '');
  }

  /* ---------- вхід і вихід ---------- */
  async function login(value) {
    token = value;
    await api('/api/messages'); // перевірка токена: маршрут доступний лише адміністратору
    store(token);
    $('login-section').hidden = true;
    $('admin-section').hidden = false;
    $('logout-btn').hidden = false;
    await Promise.all([loadProjects(), loadMessages()]);
  }

  function logout() {
    token = '';
    store('');
    location.reload();
  }

  /* ---------- проєкти ---------- */
  async function loadProjects() {
    projects = await api('/api/projects');
    const tbody = $('projects-tbody');
    tbody.replaceChildren();
    projects.forEach(function (p) {
      const tr = el('tr');
      tr.appendChild(el('td', '', p.title));
      tr.appendChild(el('td', '', p.id));
      tr.appendChild(el('td', '', p.tags.join(', ')));
      tr.appendChild(el('td', '', p.featured ? 'так' : '—'));
      const actions = el('td');
      const wrap = el('div', 'row-actions');
      const edit = el('button', 'btn btn--outline btn--small', 'Редагувати');
      edit.type = 'button';
      edit.dataset.action = 'edit';
      edit.dataset.slug = p.id;
      const del = el('button', 'btn btn--ghost btn--small btn--danger', 'Видалити');
      del.type = 'button';
      del.dataset.action = 'delete';
      del.dataset.slug = p.id;
      wrap.append(edit, del);
      actions.appendChild(wrap);
      tr.appendChild(actions);
      tbody.appendChild(tr);
    });
  }

  function field(name, label, opts = {}) {
    const box = el('div', 'form__field' + (opts.wide ? ' is-wide' : ''));
    const id = 'f-' + name.replace('.', '-');
    const lab = el('label', '', label);
    lab.htmlFor = id;
    const input = el(opts.textarea ? 'textarea' : 'input');
    input.id = id;
    input.name = name;
    if (!opts.textarea) input.type = opts.type || 'text';
    if (opts.placeholder) input.placeholder = opts.placeholder;
    const err = el('span', 'field-error');
    err.id = id + '-error';
    input.setAttribute('aria-describedby', err.id);
    box.append(lab, input, err);
    return box;
  }

  function buildForm() {
    const grid = $('project-fields');
    grid.append(
      field('title', 'Назва'),
      field('id', 'Slug (адреса)', { placeholder: 'task-tracker-api' }),
      field('cover', 'Обкладинка (до 5 символів)', { placeholder: 'API' }),
      field('tags', 'Теги через кому', { placeholder: 'Python, Docker' }),
      field('github', 'Посилання на GitHub', { type: 'url', placeholder: 'https://github.com/...' }),
      field('sortOrder', 'Порядок сортування', { type: 'number' })
    );
    const featured = el('label', 'form__checkbox is-wide');
    const cb = el('input');
    cb.type = 'checkbox';
    cb.name = 'featured';
    featured.append(cb, document.createTextNode(' Показувати на головній'));
    grid.appendChild(featured);
    const SHORT = ['role', 'term', 'type']; // короткі поля — однорядкові
    I18N_FIELDS.forEach(function (pair) {
      const long = SHORT.indexOf(pair[0]) === -1;
      grid.append(
        field(pair[0] + '.uk', pair[1] + ' (UA)', { textarea: long }),
        field(pair[0] + '.en', pair[1] + ' (EN)', { textarea: long })
      );
    });
  }

  function openForm(project) {
    const form = $('project-form');
    form.reset();
    form.querySelectorAll('.field-error').forEach((e) => { e.textContent = ''; });
    form.querySelectorAll('.is-invalid').forEach((e) => e.classList.remove('is-invalid'));
    setStatus($('project-status'), '');
    editingSlug = project ? project.id : null;
    $('dialog-title').textContent = project ? 'Редагування: ' + project.title : 'Новий проєкт';
    if (project) {
      ['title', 'id', 'cover', 'github', 'sortOrder'].forEach((k) => { form.elements[k].value = project[k]; });
      form.elements.tags.value = project.tags.join(', ');
      form.elements.featured.checked = project.featured;
      I18N_FIELDS.forEach(function (pair) {
        form.elements[pair[0] + '.uk'].value = project[pair[0]].uk;
        form.elements[pair[0] + '.en'].value = project[pair[0]].en;
      });
    }
    $('project-dialog').showModal();
    form.elements.title.focus();
  }

  function collectForm() {
    const f = $('project-form').elements;
    const body = {
      id: f.id.value, title: f.title.value, cover: f.cover.value, tags: f.tags.value,
      github: f.github.value, featured: f.featured.checked,
      sortOrder: f.sortOrder.value === '' ? undefined : Number(f.sortOrder.value)
    };
    I18N_FIELDS.forEach(function (pair) {
      body[pair[0]] = { uk: f[pair[0] + '.uk'].value, en: f[pair[0] + '.en'].value };
    });
    return body;
  }

  async function saveProject(event) {
    event.preventDefault();
    const form = $('project-form');
    form.querySelectorAll('.field-error').forEach((e) => { e.textContent = ''; });
    form.querySelectorAll('.is-invalid').forEach((e) => e.classList.remove('is-invalid'));
    try {
      if (editingSlug) {
        await api('/api/projects/' + encodeURIComponent(editingSlug), { method: 'PUT', body: JSON.stringify(collectForm()) });
      } else {
        await api('/api/projects', { method: 'POST', body: JSON.stringify(collectForm()) });
      }
      $('project-dialog').close();
      setStatus($('admin-status'), editingSlug ? 'Проєкт оновлено.' : 'Проєкт створено.', 'success');
      await loadProjects();
    } catch (err) {
      Object.keys(err.fields || {}).forEach(function (name) {
        const input = form.elements[name];
        const errEl = $('f-' + name.replace('.', '-') + '-error');
        if (input) input.classList.add('is-invalid');
        if (errEl) errEl.textContent = err.fields[name];
      });
      const firstInvalid = form.querySelector('.is-invalid');
      setStatus($('project-status'), firstInvalid ? 'Перевірте позначені поля.' : err.message, 'error');
      if (firstInvalid) firstInvalid.focus();
    }
  }

  async function deleteProject(slug) {
    const project = projects.find((p) => p.id === slug);
    if (!project || !window.confirm('Видалити проєкт «' + project.title + '»? Цю дію не можна скасувати.')) return;
    try {
      await api('/api/projects/' + encodeURIComponent(slug), { method: 'DELETE' });
      setStatus($('admin-status'), 'Проєкт видалено.', 'success');
      await loadProjects();
    } catch (err) {
      setStatus($('admin-status'), err.message, 'error');
    }
  }

  /* ---------- повідомлення ---------- */
  async function loadMessages() {
    const messages = await api('/api/messages');
    const list = $('messages-list');
    list.replaceChildren();
    const unread = messages.filter((m) => !m.isRead).length;
    $('unread-count').textContent = unread ? '(' + unread + ')' : '';
    if (!messages.length) {
      list.appendChild(el('li', 'empty-state', 'Повідомлень поки немає.'));
      return;
    }
    messages.forEach(function (m) {
      const li = el('li', 'message-card' + (m.isRead ? '' : ' is-unread'));
      const head = el('div', 'message-card__head');
      const who = el('strong', '', m.name + ' · ' + m.email);
      const when = el('time', '', new Date(m.createdAt.replace(' ', 'T') + 'Z').toLocaleString('uk-UA'));
      when.dateTime = m.createdAt;
      head.append(who, when);
      const actions = el('div', 'row-actions');
      const read = el('button', 'btn btn--outline btn--small', m.isRead ? 'Позначити непрочитаним' : 'Позначити прочитаним');
      read.type = 'button';
      read.dataset.action = 'toggle-read';
      read.dataset.id = m.id;
      read.dataset.read = String(m.isRead);
      const del = el('button', 'btn btn--ghost btn--small btn--danger', 'Видалити');
      del.type = 'button';
      del.dataset.action = 'delete-message';
      del.dataset.id = m.id;
      actions.append(read, del);
      li.append(head, el('p', 'message-card__text', m.message), actions);
      list.appendChild(li);
    });
  }

  async function messageAction(btn) {
    const id = btn.dataset.id;
    try {
      if (btn.dataset.action === 'toggle-read') {
        await api('/api/messages/' + id, { method: 'PATCH', body: JSON.stringify({ isRead: btn.dataset.read !== 'true' }) });
      } else {
        if (!window.confirm('Видалити повідомлення?')) return;
        await api('/api/messages/' + id, { method: 'DELETE' });
      }
      await loadMessages();
    } catch (err) {
      setStatus($('admin-status'), err.message, 'error');
    }
  }

  /* ---------- вкладки ---------- */
  function showTab(name) {
    ['projects', 'messages'].forEach(function (t) {
      const active = t === name;
      $('tab-' + t).classList.toggle('chip--active', active);
      $('tab-' + t).setAttribute('aria-selected', String(active));
      $('panel-' + t).hidden = !active;
    });
  }

  /* ---------- ініціалізація ---------- */
  document.addEventListener('DOMContentLoaded', function () {
    buildForm();

    $('login-form').addEventListener('submit', async function (event) {
      event.preventDefault();
      const value = $('token').value.trim();
      if (!value) return setStatus($('login-status'), 'Введіть токен.', 'error');
      try {
        await login(value);
      } catch (err) {
        token = '';
        setStatus($('login-status'), err.message, 'error');
      }
    });

    $('logout-btn').addEventListener('click', logout);
    $('tab-projects').addEventListener('click', () => showTab('projects'));
    $('tab-messages').addEventListener('click', () => showTab('messages'));
    $('new-project-btn').addEventListener('click', () => openForm(null));
    $('cancel-btn').addEventListener('click', () => $('project-dialog').close());
    $('project-form').addEventListener('submit', saveProject);

    // делегування подій для кнопок у таблиці та списку повідомлень
    $('projects-tbody').addEventListener('click', function (event) {
      const btn = event.target.closest('button[data-action]');
      if (!btn) return;
      if (btn.dataset.action === 'edit') openForm(projects.find((p) => p.id === btn.dataset.slug));
      if (btn.dataset.action === 'delete') deleteProject(btn.dataset.slug);
    });
    $('messages-list').addEventListener('click', function (event) {
      const btn = event.target.closest('button[data-action]');
      if (btn) messageAction(btn);
    });

    const saved = getStored();
    if (saved) login(saved).catch(function () { token = ''; store(''); });
  });
})();
