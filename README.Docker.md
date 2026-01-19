# TrafficVision AI - Docker Deployment

## Быстрый старт

### Требования
- Docker 20.10+
- Docker Compose 2.0+
- Минимум 2GB RAM
- Минимум 10GB свободного места на диске

### Установка и запуск

1. **Клонируйте репозиторий или распакуйте архив проекта**

2. **Создайте файл .env из примера:**
```bash
cp .env.example .env
```

3. **Отредактируйте .env и установите безопасные пароли:**
```bash
nano .env
```
Измените значения:
- `DB_PASSWORD` - пароль для базы данных
- `PGADMIN_PASSWORD` - пароль для pgAdmin

4. **Запустите все сервисы:**
```bash
docker-compose up -d
```

5. **Проверьте статус:**
```bash
docker-compose ps
```

Все сервисы должны быть в статусе "Up" или "healthy".

## Доступ к сервисам

После запуска доступны следующие сервисы:

- **Веб-приложение:** http://localhost
- **База данных PostgreSQL:** localhost:5432
- **pgAdmin (управление БД):** http://localhost:5050

### Вход в pgAdmin

1. Откройте http://localhost:5050
2. Войдите используя данные из .env:
   - Email: значение `PGADMIN_EMAIL`
   - Password: значение `PGADMIN_PASSWORD`

3. Добавьте соединение с БД:
   - Host: `db`
   - Port: `5432`
   - Database: `trafficvision`
   - Username: `trafficvision_user`
   - Password: значение `DB_PASSWORD` из .env

## Управление контейнерами

### Просмотр логов
```bash
# Все сервисы
docker-compose logs -f

# Конкретный сервис
docker-compose logs -f app
docker-compose logs -f db
```

### Остановка сервисов
```bash
docker-compose stop
```

### Запуск остановленных сервисов
```bash
docker-compose start
```

### Перезапуск сервисов
```bash
docker-compose restart
```

### Полная остановка и удаление контейнеров
```bash
docker-compose down
```

### Удаление контейнеров и данных (⚠️ удалит БД!)
```bash
docker-compose down -v
```

## Обновление приложения

### Пересборка после изменений в коде

```bash
# Остановить контейнеры
docker-compose down

# Пересобрать образ приложения
docker-compose build app

# Запустить заново
docker-compose up -d
```

## Резервное копирование

### Бэкап базы данных
```bash
docker-compose exec db pg_dump -U trafficvision_user trafficvision > backup_$(date +%Y%m%d_%H%M%S).sql
```

### Восстановление из бэкапа
```bash
docker-compose exec -T db psql -U trafficvision_user trafficvision < backup_20240119_120000.sql
```

## Production deployment

### 1. Безопасность

В production окружении:

1. **Измените все пароли в .env на сильные**
2. **Используйте HTTPS** (добавьте reverse proxy с SSL, например Nginx или Traefik)
3. **Ограничьте доступ к портам:**
   - Порт 5432 (PostgreSQL) не должен быть доступен извне
   - Порт 5050 (pgAdmin) используйте только для администрирования

4. **Обновите docker-compose.yml для production:**
```yaml
services:
  db:
    ports:
      - "127.0.0.1:5432:5432"  # Только локальный доступ
  pgadmin:
    # Закомментируйте или удалите pgadmin в production
```

### 2. Масштабирование

Для высоких нагрузок добавьте балансировщик нагрузки:

```yaml
services:
  app:
    deploy:
      replicas: 3
  
  nginx-lb:
    image: nginx:alpine
    volumes:
      - ./nginx-lb.conf:/etc/nginx/nginx.conf
    ports:
      - "80:80"
      - "443:443"
```

### 3. Мониторинг

Рекомендуется добавить мониторинг:
- Prometheus + Grafana
- Логирование через ELK Stack
- Health checks и алерты

## Troubleshooting

### База данных не запускается
```bash
# Проверьте логи
docker-compose logs db

# Проверьте права на папку с данными
ls -la postgres_data/

# Пересоздайте volume
docker-compose down -v
docker-compose up -d
```

### Приложение не собирается
```bash
# Очистите кэш Docker
docker builder prune

# Пересоберите без кэша
docker-compose build --no-cache app
```

### Проблемы с портами
```bash
# Проверьте занятые порты
sudo lsof -i :80
sudo lsof -i :5432
sudo lsof -i :5050

# Измените порты в docker-compose.yml при необходимости
```

## Дополнительная информация

### Структура volumes

- `postgres_data` - данные PostgreSQL (таблицы, индексы)
- `pgadmin_data` - настройки и данные pgAdmin

### Сеть

Все контейнеры работают в изолированной сети `trafficvision-network`, что обеспечивает безопасность и упрощает коммуникацию между сервисами.

### Health checks

Контейнер БД имеет health check, который проверяет доступность каждые 10 секунд. Приложение не запустится, пока БД не будет готова.
