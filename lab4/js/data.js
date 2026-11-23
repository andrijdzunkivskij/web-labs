/* data.js — дані сайту: проєкти та переклади інтерфейсу.
   Дані зберігаються в об'єктах, а сторінки будуються з них динамічно. */
'use strict';

window.PORTFOLIO = {
  // фільтри в тому порядку, як у прототипі; 'all' — показати всі
  filters: ['all', 'Python', 'Docker', 'FastAPI', 'Security', 'C#', 'JavaScript', 'Go'],

  projects: [
    {
      id: 'task-tracker-api',
      cover: 'API',
      title: 'Task Tracker API',
      tags: ['Python', 'FastAPI', 'Docker', 'PostgreSQL'],
      github: 'https://github.com/',
      featured: true,
      description: {
        uk: 'REST API на FastAPI з PostgreSQL: JWT-автентифікація, CRUD задач, запуск через Docker Compose.',
        en: 'REST API on FastAPI with PostgreSQL: JWT auth, task CRUD, runs with Docker Compose.'
      },
      role: { uk: 'Автор, backend', en: 'Author, backend' },
      term: { uk: '3 тижні, 2026', en: '3 weeks, 2026' },
      type: { uk: 'Особистий проєкт', en: 'Personal project' },
      task: {
        uk: 'Створити REST API для керування задачами командою з розмежуванням доступу користувачів.',
        en: 'Build a REST API for team task management with per-user access control.'
      },
      solution: {
        uk: 'FastAPI + SQLAlchemy, PostgreSQL, автентифікація через JWT, хешування паролів bcrypt, валідація даних Pydantic. Сервіс і база запускаються однією командою docker compose up.',
        en: 'FastAPI + SQLAlchemy, PostgreSQL, JWT auth, bcrypt password hashing, Pydantic validation. The service and database start with a single docker compose up.'
      },
      result: {
        uk: 'Покриття тестами 80 %, документація OpenAPI (Swagger), README з інструкцією розгортання.',
        en: '80% test coverage, OpenAPI (Swagger) docs, README with deployment guide.'
      }
    },
    {
      id: 'log-analyzer',
      cover: 'LOG',
      title: 'Log Analyzer',
      tags: ['Python', 'Docker', 'Security'],
      github: 'https://github.com/',
      featured: true,
      description: {
        uk: 'Python-скрипт для аналізу auth.log та логів nginx: виявляє спроби brute-force і формує звіт у CSV.',
        en: 'Python script that analyses auth.log and nginx logs, detects brute-force attempts and exports a CSV report.'
      },
      role: { uk: 'Автор (особистий проєкт)', en: 'Author (personal project)' },
      term: { uk: '2 тижні, 2026', en: '2 weeks, 2026' },
      type: { uk: 'Особистий проєкт', en: 'Personal project' },
      task: {
        uk: 'Автоматизувати пошук підозрілих входів у серверних логах.',
        en: 'Automate the search for suspicious logins in server logs.'
      },
      solution: {
        uk: 'Розбір логів регулярними виразами, підрахунок невдалих спроб за IP за вікно часу, вивантаження у CSV, запуск у Docker-контейнері.',
        en: 'Regex log parsing, counting failed attempts per IP within a time window, CSV export, runs in a Docker container.'
      },
      result: {
        uk: 'Скрипт обробляє 100 тис. рядків логу менш ніж за 2 секунди.',
        en: 'The script processes 100k log lines in under 2 seconds.'
      }
    },
    {
      id: 'password-checker',
      cover: '***',
      title: 'Password Checker',
      tags: ['Python', 'Flask', 'Security'],
      github: 'https://github.com/',
      featured: true,
      description: {
        uk: 'Вебутиліта перевірки надійності паролів: ентропія та перевірка витоків через k-anonymity.',
        en: 'Web tool for password strength: entropy and breach check via k-anonymity.'
      },
      role: { uk: 'Автор', en: 'Author' },
      term: { uk: '1 тиждень, 2026', en: '1 week, 2026' },
      type: { uk: 'Особистий проєкт', en: 'Personal project' },
      task: {
        uk: 'Показати користувачу, наскільки надійний його пароль, не передаючи сам пароль у мережу.',
        en: 'Show users how strong their password is without sending the password over the network.'
      },
      solution: {
        uk: 'Flask, обчислення ентропії, перевірка за першими 5 символами SHA-1 хешу (k-anonymity).',
        en: 'Flask, entropy calculation, check by the first 5 characters of the SHA-1 hash (k-anonymity).'
      },
      result: {
        uk: 'Пароль не залишає браузер у відкритому вигляді; зрозумілі поради щодо покращення.',
        en: 'The password never leaves the browser in plain text; clear improvement tips.'
      }
    },
    {
      id: 'inventory-oop',
      cover: 'C#',
      title: 'Inventory OOP',
      tags: ['C#', 'OOP'],
      github: 'https://github.com/',
      featured: false,
      description: {
        uk: 'Консольний застосунок обліку товарів на C# з використанням принципів ООП і патернів.',
        en: 'C# console app for inventory tracking built on OOP principles and patterns.'
      },
      role: { uk: 'Автор (навчальний проєкт)', en: 'Author (study project)' },
      term: { uk: '2 тижні, 2026', en: '2 weeks, 2026' },
      type: { uk: 'Навчальний проєкт', en: 'Study project' },
      task: {
        uk: 'Закріпити принципи ООП: інкапсуляцію, наслідування, поліморфізм.',
        en: 'Practise OOP principles: encapsulation, inheritance, polymorphism.'
      },
      solution: {
        uk: 'Класи товарів та складу, інтерфейси, патерни Repository і Factory, збереження в JSON.',
        en: 'Product and warehouse classes, interfaces, Repository and Factory patterns, JSON storage.'
      },
      result: {
        uk: 'Робота зарахована в курсі ООП; код покрито модульними тестами.',
        en: 'Accepted in the OOP course; code covered with unit tests.'
      }
    },
    {
      id: 'phishing-quiz',
      cover: '?!',
      title: 'Phishing Quiz',
      tags: ['JavaScript', 'HTML/CSS', 'Security'],
      github: 'https://github.com/',
      featured: false,
      description: {
        uk: 'Інтерактивна вікторина для навчання розпізнаванню фішингових листів.',
        en: 'Interactive quiz that teaches how to spot phishing emails.'
      },
      role: { uk: 'Автор, frontend', en: 'Author, frontend' },
      term: { uk: '1 тиждень, 2026', en: '1 week, 2026' },
      type: { uk: 'Особистий проєкт', en: 'Personal project' },
      task: {
        uk: 'Навчити однокурсників помічати ознаки фішингу.',
        en: 'Teach classmates to notice the signs of phishing.'
      },
      solution: {
        uk: 'Чистий JavaScript, 15 прикладів листів, пояснення після кожної відповіді.',
        en: 'Vanilla JavaScript, 15 sample emails, explanation after every answer.'
      },
      result: {
        uk: 'Вікторину пройшли понад 40 студентів.',
        en: 'More than 40 students have taken the quiz.'
      }
    },
    {
      id: 'portfolio-website',
      cover: 'WEB',
      title: 'Portfolio Website',
      tags: ['JavaScript', 'HTML/CSS', 'Docker'],
      github: 'https://github.com/',
      featured: false,
      description: {
        uk: 'Цей сайт: адаптивна верстка, контактна форма із захистом від спаму, Docker-деплой.',
        en: 'This website: responsive layout, contact form with spam protection, Docker deploy.'
      },
      role: { uk: 'Автор', en: 'Author' },
      term: { uk: '2026', en: '2026' },
      type: { uk: 'Навчальний проєкт', en: 'Study project' },
      task: {
        uk: 'Створити персональний сайт-портфоліо за власним прототипом.',
        en: 'Build a personal portfolio website from my own prototype.'
      },
      solution: {
        uk: 'Семантичний HTML, CSS Grid і Flexbox, JavaScript для інтерактивності.',
        en: 'Semantic HTML, CSS Grid and Flexbox, JavaScript for interactivity.'
      },
      result: {
        uk: 'Сайт коректно відображається на десктопі, планшеті й телефоні.',
        en: 'The site renders correctly on desktop, tablet and phone.'
      }
    }
  ],

  i18n: {
    uk: {
      'nav.home': 'Головна', 'nav.about': 'Про мене', 'nav.projects': 'Проєкти', 'nav.contacts': 'Контакти',
      'nav.menu': 'Меню', 'btn.cv': 'Завантажити CV', 'btn.projects': 'Переглянути проєкти',
      'btn.contact': "Зв'язатися", 'btn.write': 'Написати мені', 'btn.details': 'Детальніше →',
      'btn.all': 'Усі проєкти →', 'btn.back': '← Усі проєкти', 'btn.demo': 'Демо ↗', 'btn.top': 'Нагору',
      'hero.badge': 'Відкритий до пропозицій',
      'hero.lead': 'Студент 2 курсу спеціальності «Кібербезпека» (ДТЕУ, Київ). Пишу backend на Python, пакую сервіси в Docker і думаю про безпеку з першого рядка коду.',
      'hero.stack': 'Основний стек:',
      'home.featured': 'Обрані проєкти',
      'home.cta.title': 'Шукаю першу роботу Junior Python Developer',
      'home.cta.text': 'Офіс у Києві, гібрид або віддалено. Відповідаю на повідомлення протягом 24 годин.',
      'projects.title': 'Проєкти',
      'projects.lead': 'Реальні проєкти з кодом на GitHub. Оберіть технологію, щоб відфільтрувати список.',
      'projects.all': 'Усі', 'projects.found': 'Знайдено проєктів:',
      'projects.empty': 'За цим фільтром проєктів поки немає. Оберіть іншу технологію.',
      'project.task': 'Задача', 'project.solution': 'Рішення', 'project.result': 'Результат',
      'project.role': 'Роль', 'project.term': 'Термін', 'project.type': 'Тип', 'card.role': 'Роль:',
      'about.title': 'Про мене', 'about.lead': 'Коротко про те, хто я, що вмію і куди рухаюся.',
      'about.hello': 'Привіт! Я Андрій',
      'about.p1': 'Навчаюся на 2 курсі спеціальності «Кібербезпека» на факультеті інформаційних технологій ДТЕУ (Київ). Мене цікавить backend-розробка на Python і те, як робити сервіси одразу безпечними.',
      'about.p2': 'У вільний час роблю власні проєкти: API, утиліти для аналізу логів, інструменти перевірки паролів. Вивчаю Docker, Linux і готуюся до сертифікації з blue team.',
      'about.skills': 'Навички', 'about.db': 'Бази даних', 'about.security': 'Безпека', 'about.edu': 'Освіта',
      'contacts.title': 'Контакти',
      'contacts.lead': 'Відкритий до пропозицій щодо роботи Junior Python Developer. Відповідаю протягом 24 годин.',
      'contacts.city': 'Місто', 'contacts.cityValue': 'Київ, Україна',
      'form.title': 'Напишіть мені', 'form.name': "Ім'я", 'form.email': 'Email', 'form.message': 'Повідомлення',
      'form.agree': 'Погоджуюся з політикою конфіденційності', 'form.send': 'Надіслати',
      'form.err.required': 'Це поле обов\'язкове.',
      'form.err.name': "Ім'я має містити від 2 до 50 літер.",
      'form.err.email': 'Введіть коректну адресу, наприклад name@example.com.',
      'form.err.messageShort': 'Повідомлення занадто коротке: мінімум 10 символів.',
      'form.err.messageLong': 'Повідомлення занадто довге: максимум 1000 символів.',
      'form.err.agree': 'Потрібна згода з політикою конфіденційності.',
      'form.err.summary': 'Виправте позначені поля та спробуйте ще раз.',
      'form.success': 'Дякую! Повідомлення надіслано, я відповім протягом 24 годин.',
      'footer.privacy': 'Політика конфіденційності · Адмін'
    },
    en: {
      'nav.home': 'Home', 'nav.about': 'About', 'nav.projects': 'Projects', 'nav.contacts': 'Contacts',
      'nav.menu': 'Menu', 'btn.cv': 'Download CV', 'btn.projects': 'View projects',
      'btn.contact': 'Contact me', 'btn.write': 'Write to me', 'btn.details': 'Details →',
      'btn.all': 'All projects →', 'btn.back': '← All projects', 'btn.demo': 'Demo ↗', 'btn.top': 'Back to top',
      'hero.badge': 'Open to work',
      'hero.lead': '2nd-year Cybersecurity student (SUTE, Kyiv). I build Python backends, ship services in Docker and think about security from the first line of code.',
      'hero.stack': 'Main stack:',
      'home.featured': 'Featured projects',
      'home.cta.title': 'Looking for my first Junior Python Developer job',
      'home.cta.text': 'Office in Kyiv, hybrid or remote. I reply within 24 hours.',
      'projects.title': 'Projects',
      'projects.lead': 'Real projects with code on GitHub. Pick a technology to filter the list.',
      'projects.all': 'All', 'projects.found': 'Projects found:',
      'projects.empty': 'No projects for this filter yet. Try another technology.',
      'project.task': 'Task', 'project.solution': 'Solution', 'project.result': 'Result',
      'project.role': 'Role', 'project.term': 'Duration', 'project.type': 'Type', 'card.role': 'Role:',
      'about.title': 'About me', 'about.lead': 'In short: who I am, what I can do and where I am heading.',
      'about.hello': "Hi! I'm Andrii",
      'about.p1': "I'm a 2nd-year Cybersecurity student at the Faculty of IT, SUTE (Kyiv). I'm into Python backend development and building services that are secure from day one.",
      'about.p2': 'In my free time I build my own projects: APIs, log analysis tools, password checkers. I am learning Docker and Linux and preparing for a blue team certification.',
      'about.skills': 'Skills', 'about.db': 'Databases', 'about.security': 'Security', 'about.edu': 'Education',
      'contacts.title': 'Contacts',
      'contacts.lead': 'Open to Junior Python Developer offers. I reply within 24 hours.',
      'contacts.city': 'City', 'contacts.cityValue': 'Kyiv, Ukraine',
      'form.title': 'Write to me', 'form.name': 'Name', 'form.email': 'Email', 'form.message': 'Message',
      'form.agree': 'I agree with the privacy policy', 'form.send': 'Send',
      'form.err.required': 'This field is required.',
      'form.err.name': 'Name must contain 2 to 50 letters.',
      'form.err.email': 'Enter a valid address, e.g. name@example.com.',
      'form.err.messageShort': 'Message is too short: at least 10 characters.',
      'form.err.messageLong': 'Message is too long: 1000 characters max.',
      'form.err.agree': 'You need to accept the privacy policy.',
      'form.err.summary': 'Please fix the highlighted fields and try again.',
      'form.success': "Thank you! Your message has been sent, I'll reply within 24 hours.",
      'footer.privacy': 'Privacy policy · Admin'
    }
  }
};
