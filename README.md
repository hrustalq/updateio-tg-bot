# Стартовое приложение NestJS

Это стартовое приложение на базе NestJS, предоставляющее основу для быстрого начала разработки.

## Оглавление

- [Описание](#описание)
- [Используемые технологии](#используемые-технологии)
- [Требования](#требования)
- [Установка](#установка)
- [Запуск приложения](#запуск-приложения)
- [Структура проекта](#структура-проекта)
- [Переменные окружения](#переменные-окружения)

## Описание

Данный проект представляет собой базовую структуру приложения NestJS, готовую к расширению и настройке под ваши конкретные нужды.

## Используемые технологии

- [NestJS](https://nestjs.com/) - прогрессивный Node.js фреймворк для создания эффективных и масштабируемых серверных приложений.
- [Express](https://expressjs.com/) - быстрый, гибкий, минималистичный веб-фреймворк для Node.js.
- [TypeScript](https://www.typescriptlang.org/) - типизированный суперсет JavaScript, компилируемый в чистый JavaScript.
- [Helmet](https://helmetjs.github.io/) - помогает защитить приложение от некоторых широко известных веб-уязвимостей путем соответствующей настройки HTTP-заголовков.
- [RxJS](https://rxjs.dev/) - библиотека для композиции асинхронных и событийно-ориентированных программ с использованием наблюдаемых последовательностей.
- [Swagger](https://swagger.io/) - инструмент для документирования API.
- [class-validator](https://github.com/typestack/class-validator) - декоратор-основанная валидация для классов.
- [class-transformer](https://github.com/typestack/class-transformer) - позволяет преобразовывать простые объекты в классы и наоборот.
- [csurf](https://github.com/expressjs/csurf) - CSRF защита для Express и других веб-фреймворков.
- [cookie-parser](https://github.com/expressjs/cookie-parser) - парсер для работы с cookies в Express.
- [@nestjs/config](https://docs.nestjs.com/techniques/configuration) - модуль для управления конфигурацией приложения.
- [@nestjs/throttler](https://docs.nestjs.com/security/rate-limiting) - модуль для ограничения скорости запросов.

## Требования

- Node.js (версия 14 или выше)
- npm (версия 6 или выше)

## Установка

1. Клонируйте репозиторий:
   ```
   git clone https://github.com/hrustalq/nest-starter.git
   ```

2. Перейдите в директорию проекта:
   ```
   cd nest-starter
   ```

3. Установите зависимости:
   ```
   npm install
   ```

4. Скопируйте файл `.env.example` и переименуйте его в `.env`, затем настройте переменные окружения:
   ```
   cp .env.example .env
   ```

## Запуск приложения

- Для запуска в режиме разработки:
  ```
  npm run start:dev
  ```

- Для запуска в продакшн режиме:
  ```
  npm run start:prod
  ```

## Структура проекта

- `src/` - исходный код приложения
- `src/common/config/` - конфигурационные файлы

## Переменные окружения

| Название | Описание | Значение по умолчанию |
|----------|----------|------------------------|
| PORT | Порт, на котором будет запущено приложение | 3000 |
| HOST | Хост, на котором будет запущено приложение | 0.0.0.0 |
| API_PREFIX | Префикс для всех API-маршрутов | /api |
| CORS_ORIGIN | Разрешенные источники для CORS | * |
| CORS_METHODS | Разрешенные HTTP-методы для CORS | GET,HEAD,PUT,PATCH,POST,DELETE |
| CORS_ALLOWED_HEADERS | Разрешенные заголовки для CORS | Content-Type, Accept, Authorization |
| CORS_CREDENTIALS | Разрешить передачу учетных данных для CORS | true |
| CORS_PREFLIGHT_CONTINUE | Продолжать обработку после предварительного запроса CORS | false |
| CORS_OPTIONS_SUCCESS_STATUS | Код успешного ответа для опций CORS | 204 |
| SWAGGER_TITLE | Заголовок Swagger документации | API Documentation |
| SWAGGER_DESCRIPTION | Описание Swagger документации | API documentation for the application |
| SWAGGER_VERSION | Версия API в Swagger документации | 1.0 |
| SWAGGER_TAG | Тег API в Swagger документации | API |
| SWAGGER_PATH | Путь к Swagger документации | /api/docs |
| CSURF_MAX_AGE | Максимальное время жизни CSRF токена (в секундах) | 3600 |
| THROTTLER_TTL | Время жизни для ограничения запросов (в секундах) | 60 |
| THROTTLER_LIMIT | Лимит запросов для ограничения | 10 |