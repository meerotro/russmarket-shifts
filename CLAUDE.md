# График смен — заметки для работы с репозиторием

Тестовое задание: редактор графика смен сотрудников. Одно приложение Laravel отдаёт JSON API и
SPA на Vue 3. Спецификация — `docs/spec.md`, макеты и токены — `design/`.

## Стек

- PHP 8.3+, Laravel 13, PostgreSQL 16, Pest.
- Vue 3 (Composition API, `<script setup>`), TypeScript strict, Pinia, Vue Router, Vite, Vitest.
- ESLint + Prettier для фронта, Pint для PHP. CI — GitHub Actions (`.github/workflows/ci.yml`).

## Структура

```
app/Http/Controllers/Api   тонкие контроллеры
app/Http/Requests          валидация (Form Requests)
app/Http/Resources         формат ответов
app/Services               ShiftDuration, ScheduleService — вся логика бэкенда
resources/js/api           единственный HTTP-клиент и типы ответов
resources/js/lib           чистые функции (время, даты)
resources/js/stores        Pinia: данные графика и черновик изменений
resources/js/composables   период, выделение, покрытие, drag-and-drop
resources/js/ui            UI-кит без предметной логики
resources/js/components    компоненты графика и каркаса страницы
resources/js/pages         страницы роутера
```

## Команды

| Что                         | Команда                                  |
| --------------------------- | ---------------------------------------- |
| Первый запуск               | `composer setup`                         |
| Разработка (API + Vite)     | `composer dev` → http://localhost:8000   |
| Тесты бэкенда               | `php artisan test`                       |
| Тесты фронта                | `npm test`                               |
| Типы                        | `npm run typecheck`                      |
| Линт                        | `npm run lint`, `vendor/bin/pint --test` |
| Форматирование              | `npm run format`, `vendor/bin/pint`      |
| Сборка                      | `npm run build`                          |
| Локальная база (Ubuntu/WSL) | `sudo bash scripts/setup-local-db.sh`    |
| Деплой                      | см. `docs/deploy.md`                     |

## Соглашения

- TypeScript strict, без `any`. Типы ответов API живут в `resources/js/api/types.ts`.
- Бизнес-логика — в сторе, composables и `lib/`. Компоненты отображают данные и вызывают действия.
- Компоненты `ui/` ничего не знают о сменах и сотрудниках: только props, emits и слоты.
- Все запросы идут через `resources/js/api/client.ts`; ошибки приводятся к `ApiError` там же.
- Длительность смены считается в одном месте на каждой стороне: `App\Services\ShiftDuration` и
  `resources/js/lib/time.ts`. Правила одинаковые, оба покрыты тестами.
- Цвета и размеры — только через CSS-переменные из `resources/js/styles/tokens.css`.
- Тесты бэкенда идут на PostgreSQL (база `<DB_DATABASE>_test`), как и продакшен.

## Правила

- Секреты не коммитим: `.env`, ключи и пароли в git не попадают.
- Перед коммитом: `npm run lint && npm run typecheck && npm test && vendor/bin/pint --test && php artisan test`.
- Коммиты небольшие, сообщение описывает, что изменилось и зачем.
