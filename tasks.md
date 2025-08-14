# Frontend Development Tasks

## Project Setup
- [x] Create Next.js project with TypeScript
- [x] Configure Tailwind CSS
- [x] Setup shadcn/ui component library
- [x] Configure API client (axios)
- [x] Setup authentication store (zustand)

## Authentication
- [x] Login page
- [x] JWT token management
- [x] Protected routes
- [ ] User profile page

## Layout & Navigation
- [x] Main layout with sidebar navigation
- [ ] Responsive header with user menu
 - [ ] Breadcrumbs navigation
- [x] Dashboard layout
- [x] раздел фильтры в списках выглядят  плохо. 
- [x] необходимо обовить версии next.js и tailwind

## Reference Management
- [x] Wallets list and detail pages
- [x] Cash flow items management with hierarchy view
- [x] Projects management

## Financial Operations
- [x] Receipts CRUD operations
- [x] Expenditures management with budget inclusion
- [x] Transfers between wallets
- [x] Budgets planning interface
- [x] Auto-payments setup and management

## Reports & Analytics
- [x] Cash flow summary dashboard
- [x] Budget execution reports
- [x] Financial charts and graphs
- [x] Balance overview by wallet
- [x] Export functionality

## Advanced Features
- [ ] Financial planning calendar view
- [ ] Notifications for budget limits
- [x] Mobile responsive design
- [x] Dark/light theme support
 - [ ] Performance optimization
  - [x] Enhanced filtering and search functionality
  - [x] Copy/duplicate functionality for all entities

## Testing & Deployment
- [ ] Unit testing key components
- [ ] E2E testing for critical flows
- [ ] Deployment configuration
- [ ] CI/CD setup

## Backend API Alignment (OpenAPI)
- [x] Привести `AuthService` к API:
  - [x] `getProfile`: адаптировать к `GET /api/v1/profile/` (возвращает массив) или перейти на `GET /api/v1/profile/{id}/`
  - [x] `updateProfile`: использовать `PUT /api/v1/profile/{id}/`
  - [ ] Страница профиля пользователя (UI)
- [x] Поля сумм отправлять строками (decimal c 2 знаками), парсить при получении
- [x] Добавить поле `number` (обязательное) в формы и сервисы: Приходы, Расходы, Переводы, Бюджеты, Автоплатежи
- [x] Маппинг полей при запросах:
  - [x] `description` → `comment`
  - [ ] Даты как ISO datetime (`date`, `date_start`)
  - [x] `Transfer`: `wallet_from` → `wallet_out`, `wallet_to` → `wallet_in`
  - [x] `Budget`: `type` → `type_of_budget` (boolean), добавить `amount_month`, `date_start`
  - [x] `AutoPayment`: заменить `next_date`/`period_days` на `date_start`/`amount_month`, использовать `wallet_in`/`wallet_out`, `comment`
- [x] Сервисы: обновить сигнатуры и типы под OpenAPI (в `services/*` и `types/*`)
- [x] Фильтры бюджетов: заменить `type='income'|'expense'` на `type_of_budget=true|false`
- [x] Кошельки (Wallet): поддержать `code`, `hidden`; убрать/не отправлять `description`
- [x] Проекты (Project): поддержать `code`, убрать `description`, `is_active`
- [x] Статьи ДДС (CashFlowItem): поддержать `code`, `include_in_budget`; убрать `description`
- [ ] Проверить `GET /wallets/{id}/balance/` и привести тип `WalletService.getWalletBalance` к фактической схеме
- [ ] (Опционально) Интегрировать эндпоинты графиков планирования: `*-graphics` в календарный/плановый функционал
