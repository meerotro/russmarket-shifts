# График смен

Тестовое задание Fullstack-разработчика: интерфейс создания графика смен сотрудников.
Vue 3 + TypeScript + Pinia на фронте, Laravel + PostgreSQL на бэке.

Подробности — в `docs/spec.md`. Полное описание появится к сдаче.

## Запуск

```bash
cp .env.example .env        # указать доступ к PostgreSQL
composer setup              # зависимости, ключ, миграции с демо-данными, сборка фронта
composer dev                # http://localhost:8000
```

## Проверки

```bash
php artisan test            # бэкенд (Pest, PostgreSQL)
npm test                    # фронтенд (Vitest)
npm run typecheck && npm run lint
```
