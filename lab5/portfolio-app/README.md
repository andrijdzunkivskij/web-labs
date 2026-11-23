# Портфоліо розробника — вебзастосунок (ЛР5)

Автор: Джунківський Андрій, група 2-15, ДТЕУ.

Клієнтська частина з лабораторних робіт № 3–4 (HTML, CSS, JavaScript), сервер на **Node.js + Express**, база даних **SQLite** (вбудований модуль `node:sqlite`), адмін-панель для керування проєктами та повідомленнями.

## Запуск локально

Потрібен Node.js 22.13 або новіший.

```bash
npm install
cp .env.example .env          # задайте ADMIN_TOKEN (мінімум 16 символів)
ADMIN_TOKEN=ваш_токен npm start
# відкрийте http://localhost:3000, адмін-панель: http://localhost:3000/admin.html
```

Тести API: `npm test`.

## Змінні середовища

| Змінна | Призначення |
|---|---|
| `PORT` | порт сервера (за замовчуванням 3000) |
| `ADMIN_TOKEN` | секретний токен адміністратора; без нього адмін-маршрути вимкнені (503) |
| `DB_PATH` | шлях до файлу бази даних (за замовчуванням `data/portfolio.db`) |

## REST API

| Метод | Маршрут | Доступ | Опис |
|---|---|---|---|
| GET | `/api/health` | усі | перевірка стану сервера |
| GET | `/api/projects?tag=Docker` | усі | список проєктів, необов'язковий фільтр |
| GET | `/api/projects/:slug` | усі | один проєкт |
| POST | `/api/projects` | адмін | створити проєкт |
| PUT | `/api/projects/:slug` | адмін | оновити проєкт |
| DELETE | `/api/projects/:slug` | адмін | видалити проєкт |
| POST | `/api/messages` | усі | надіслати повідомлення з форми (ліміт 5 за 10 хв) |
| GET | `/api/messages` | адмін | список повідомлень |
| PATCH | `/api/messages/:id` | адмін | позначити прочитаним `{ "isRead": true }` |
| DELETE | `/api/messages/:id` | адмін | видалити повідомлення |

Адмін-запити передають заголовок `Authorization: Bearer <ADMIN_TOKEN>`.

## Розгортання на Render

1. Завантажити репозиторій на GitHub.
2. На render.com: **New → Web Service**, підключити репозиторій.
3. Root Directory `lab5/portfolio-app` (якщо застосунок лежить у підпапці репозиторію), Runtime **Node**, Build command `npm install`, Start command `npm start`, тариф Free.
4. У розділі **Environment** додати `ADMIN_TOKEN` (згенерувати: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`) і `NODE_ENV=production`.
5. Для збереження бази між перезапусками підключити Persistent Disk і задати `DB_PATH=/var/data/portfolio.db` (на безкоштовному тарифі база скидається до початкових даних після перезапуску).

Альтернатива — Docker: `docker build -t portfolio . && docker run -p 3000:3000 -e ADMIN_TOKEN=... -v portfolio-data:/app/data portfolio`.

## Структура

```
server/            index.js (запуск), app.js (Express), db.js (SQLite),
                   validators.js, middleware/security.js, routes/
public/            HTML, css/, js/ (клієнт), admin.html
tests/api.test.js  автоматичні тести API (node:test)
```
