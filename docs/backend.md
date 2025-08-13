# Django ЛК - Система управления личными финансами

Веб-приложение для управления личными финансами с REST API, построенное на Django и Django REST Framework.

## Описание

Система позволяет вести учет доходов и расходов, управлять кошельками, планировать бюджет и настраивать автоматические платежи. Поддерживает как частных лиц, так и компании.

## Основные возможности

### 📁 Справочники
- **Кошельки** - управление различными источниками средств
- **Статьи движения средств** - категории доходов и расходов  
- **Проекты** - группировка операций по проектам

### 📊 Финансовые операции
- **Приходы** - учет поступлений денежных средств
- **Расходы** - учет трат с возможностью включения в бюджет
- **Переводы** - перемещение средств между кошельками
- **Бюджеты** - планирование доходов и расходов
- **Автоплатежи** - настройка регулярных операций

### 📈 Аналитика
- Регистры движения денежных средств
- Бюджетные отчеты по доходам и расходам
- Графики планирования операций

### 👥 Пользователи
- Кастомная модель пользователя
- Поддержка компаний и частных лиц
- JWT аутентификация

## Технический стек

- **Backend**: Django 4.1.2
- **API**: Django REST Framework 3.14.0
- **База данных**: PostgreSQL 14
- **Аутентификация**: JWT (Simple JWT)
- **CORS**: django-cors-headers
- **Контейнеризация**: Docker + Docker Compose

## Требования

- Docker и Docker Compose
- Или: Python 3.8+, PostgreSQL 14+

## Быстрый старт с Docker

### 1. Клонирование репозитория
```bash
git clone https://github.com/Trialexl/djangolk
cd djangolk
```

### 2. Запуск с Docker Compose
```bash
docker-compose up --build
```

**Доступ к приложению:**
- **API**: `http://127.0.0.1:8000/api/v1/`
- **Админка**: `http://127.0.0.1:8000/admin/`
- **Веб-интерфейс**: `http://127.0.0.1:8000/web/`

**Автоматически создается суперпользователь:**
- Логин: `admin`
- Пароль: `admin123`

## Локальная установка

### 1. Настройка PostgreSQL
```bash
# Создайте базу данных
createdb djangolk
```

### 2. Настройка переменных окружения
```bash
# Скопируйте пример файла
cp env.example .env

# Отредактируйте .env файл с вашими настройками
```

### 3. Установка зависимостей
```bash
pip install -r requirements.txt
```

### 4. Миграция базы данных
```bash
python manage.py migrate
```

### 5. Создание суперпользователя
```bash
python manage.py createsuperuser
```

### 6. Запуск сервера разработки
```bash
python manage.py runserver
```

## API Endpoints

### Аутентификация
- `POST /api/v1/auth/token/` - получение JWT токена
- `POST /api/v1/auth/refresh/` - обновление токена
- `POST /api/v1/auth/logout/` - выход из системы

### Пользователи
- `GET/POST /api/v1/users/` - управление пользователями (только админ)
- `GET/POST /api/v1/profile/` - профиль текущего пользователя

### Справочники
- `GET/POST/PUT/DELETE /api/v1/cash-flow-items/` - статьи движения средств
- `GET/POST/PUT/DELETE /api/v1/wallets/` - кошельки
- `GET/POST/PUT/DELETE /api/v1/projects/` - проекты

### Финансовые операции
- `GET/POST/PUT/DELETE /api/v1/receipts/` - приходы
- `GET/POST/PUT/DELETE /api/v1/expenditures/` - расходы
- `GET/POST/PUT/DELETE /api/v1/transfers/` - переводы
- `GET/POST/PUT/DELETE /api/v1/budgets/` - бюджеты
- `GET/POST/PUT/DELETE /api/v1/auto-payments/` - автоплатежи

### Графики планирования
- `GET/POST/PUT/DELETE /api/v1/expenditure-graphics/` - графики расходов
- `GET/POST/PUT/DELETE /api/v1/transfer-graphics/` - графики переводов
- `GET/POST/PUT/DELETE /api/v1/budget-graphics/` - графики бюджетов
- `GET/POST/PUT/DELETE /api/v1/auto-payment-graphics/` - графики автоплатежей

### Кастомные endpoints
- `GET /api/v1/cash-flow-items/hierarchy/` - иерархическая структура статей
- `GET /api/v1/wallets/{id}/balance/` - баланс кошелька

### Query параметры фильтрации
- `?include_in_budget=true/false` - фильтр расходов по включению в бюджет
- `?type=income/expense` - фильтр бюджетов по типу (доход/расход)
- `?is_transfer=true/false` - фильтр автоплатежей по типу операции
- `?document={uuid}` - фильтр графиков по документу

### Служебные
- `POST /api/v1/legacy/clear/<type_doc>/<document_id>/` - очистка записей (DEPRECATED)

## Примеры использования API

### Аутентификация
```bash
# Получение токена
curl -X POST http://localhost:8000/api/v1/auth/token/ \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Использование токена
curl -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  http://localhost:8000/api/v1/wallets/
```

### Фильтрация данных
```bash
# Только расходы, включенные в бюджет
GET /api/v1/expenditures/?include_in_budget=true

# Только бюджеты доходов
GET /api/v1/budgets/?type=income

# Автоплатежи-переводы
GET /api/v1/auto-payments/?is_transfer=true

# Графики для конкретного документа
GET /api/v1/budget-graphics/?document=uuid-here
```

### Кастомные endpoints
```bash
# Получить иерархию статей движения средств
GET /api/v1/cash-flow-items/hierarchy/

# Получить баланс кошелька
GET /api/v1/wallets/uuid-here/balance/
```

### Права доступа
- **Админы**: полный доступ ко всем операциям
- **Пользователи**: только чтение справочников, полный доступ к своим данным
- **Анонимные**: доступ запрещен

## Архитектура URL маршрутов

### Основные маршруты
```
/                       -> Редирект на админку
/admin/                 -> Django административная панель
/web/                   -> HTML интерфейс (опционально)
/api/v1/                -> REST API версии 1
```

### Структура API v1
```
/api/v1/auth/           -> Аутентификация (JWT)
/api/v1/users/          -> Управление пользователями
/api/v1/profile/        -> Профиль текущего пользователя

/api/v1/cash-flow-items/    -> Статьи движения средств
/api/v1/wallets/            -> Кошельки  
/api/v1/projects/           -> Проекты

/api/v1/receipts/           -> Приходы
/api/v1/expenditures/       -> Расходы
/api/v1/transfers/          -> Переводы
/api/v1/budgets/            -> Бюджеты
/api/v1/auto-payments/      -> Автоплатежи

/api/v1/*-graphics/         -> Графики планирования
```

## Структура проекта

```
djangolk/
├── lk/                     # Основные настройки Django
│   ├── settings.py         # Конфигурация проекта
│   ├── urls.py             # Главные URL маршруты
│   └── api_urls.py         # Центральные API маршруты
├── money/                  # Приложение управления финансами
│   ├── models.py           # Модели данных с FinancialOperationMixin
│   ├── views.py            # API ViewSets с расширенной функциональностью
│   ├── permissions.py      # Кастомные permissions
│   ├── web_views.py        # HTML представления
│   ├── serializers.py      # Сериализаторы DRF
│   ├── urls.py             # Обратная совместимость
│   ├── api_urls.py         # API маршруты (новые)
│   ├── web_urls.py         # HTML маршруты
│   ├── migrations/         # Миграции БД
│   └── templates/          # HTML шаблоны
├── users/                  # Приложение пользователей
│   ├── models.py           # Кастомная модель пользователя
│   ├── views.py            # API views пользователей
│   ├── urls.py             # Обратная совместимость
│   └── api_urls.py         # API маршруты пользователей
├── Dockerfile              # Контейнеризация
├── docker-compose.yml      # Оркестрация сервисов
├── docker-entrypoint.sh    # Инициализация контейнера
├── env.example             # Пример переменных окружения
├── task.md                 # Задачи по улучшению проекта
├── manage.py               # Django управление
└── requirements.txt        # Зависимости Python
```

## Особенности реализации

### 🏗️ Архитектурные решения
- **UUID первичные ключи** для всех моделей
- **Архитектура с миксинами** - управление регистрами через `FinancialOperationMixin`
- **Явное управление регистрами** - вместо сигналов используются методы моделей
- **Разделение HTML и API** - отдельные модули для веб-интерфейса и REST API
- **Kebab-case именование** endpoints для консистентности
- **Кастомные permissions** - гранулярное управление доступом (IsAdminOrReadOnly, IsOwnerOrAdmin)
- **Query фильтрация** - расширенные возможности поиска и фильтрации данных

### 📊 Бизнес-логика
- **Мягкое удаление** - записи помечаются как удаленные, но не удаляются физически
- **Иерархические справочники** - статьи движения средств поддерживают вложенность
- **Автоматические регистры** - при сохранении операций обновляются регистры движения средств и бюджетов

### 🐳 DevOps
- **Контейнеризация** - полная поддержка Docker с автоматической настройкой
- **Переменные окружения** - безопасная конфигурация через .env файлы
- **Автоматическая инициализация** - создание суперпользователя при первом запуске

## Переменные окружения

Основные переменные для конфигурации:

```env
# Django
SECRET_KEY=your-secret-key
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1

# Database
DB_HOST=localhost
DB_NAME=djangolk
DB_USER=postgres
DB_PASSWORD=postgres
DB_PORT=5432

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000
```

## Команды Docker

```bash
# Запуск в фоне
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Пересборка
docker-compose up --build

# Подключение к контейнеру
docker-compose exec web bash
```

## Безопасность

✅ **Улучшения безопасности:**
- SECRET_KEY загружается из переменных окружения
- Настройки базы данных через переменные окружения
- DEBUG контролируется переменной окружения
- JWT аутентификация для API доступа
- Разделение административных и пользовательских endpoints

## Последние обновления

### v2.1 - REST API Enhancement ⚡
- 🛡️ **Кастомные permissions**: IsAdminOrReadOnly, IsOwnerOrAdmin, IsReadOnlyOrAdmin
- 🔍 **Query фильтрация**: include_in_budget, type, is_transfer, document
- 🎯 **Custom actions**: /hierarchy/, /balance/ endpoints
- 🔄 **Мягкое удаление**: perform_destroy с автоочисткой регистров
- ✅ **Валидация**: perform_create с бизнес-правилами
- 📊 **Улучшенная фильтрация**: автоматическое исключение deleted=False
- ⚠️ **Deprecated endpoints**: legacy/clear/ с миграционными рекомендациями

### v2.0 - Архитектурные улучшения ✨
- 🔄 **Рефакторинг маршрутов**: Четкое разделение HTML и API
- 🏗️ **Миксин для регистров**: Замена post_save сигналов на явные методы
- 🐳 **Docker контейнеризация**: Полная поддержка Docker Compose
- 🗄️ **PostgreSQL**: Переход с SQLite на производственную БД
- 📝 **Kebab-case API**: Современное именование endpoints
- ⚙️ **Переменные окружения**: Безопасная конфигурация

## Лицензия

Проект разработан для личного использования.