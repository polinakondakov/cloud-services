# Docker Lab

Лабораторная работа: запуск двух веб-сервисов в Docker и Docker Compose.

## Стек
Python 3.12, FastAPI, Uvicorn, Docker, Docker Compose.

## Структура
- `service-a/` — сервис A (порт 8001)
- `service-b/` — сервис B (порт 8002)
- `docker-compose.yml` — запуск обоих сервисов

## Dockerfile
Собирает образ: `python:3.12-slim` → установка зависимостей → копирование `app.py` → запуск Uvicorn на порту 8000.
Dockerfile у обоих сервисов одинаковый.

## docker-compose.yml
Два сервиса: `service-a` (порт 8001) и `service-b` (порт 8002). Compose сам создаёт сеть и запускает контейнеры.

## Запуск
docker compose up --build

## Проверка
- http://localhost:8001/ — Service A
- http://localhost:8002/ — Service B

## Остановка
docker compose down

