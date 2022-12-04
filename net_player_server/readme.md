# Digital signage server

## Развернуть с помощью docker'а (основный вариант)

Требуется:

 * docker

### Запуск

```
./rundocker.sh
```

или

```
sudo ./rundocker.sh
```

Запущенный сервер будет доступен по адресу http://localhost:8008/

Логин - `admin`
Пароль - `equirectangular`

## Запуск как приложения python (альтернативный вариант)

Требуются:

 * ffmpeg
 * mysql/mariadb
 * python3
    * cherrypy
    * bottle
    * bottle_mysql
    * requests
    * bsddb3
    * zmq
    * MySQLdb
    * Pillow

### Настройка

Настройка выполняется редактированием файла settings.py

Параметры `DB_*` отвечают за подключение к БД Mysql

Параметры `*_DIR` указывают пути к файлам видео и превью (**ПАПКИ ДОЛЖНЫ БЫТЬ ДОСТУПНЫ ДЛЯ ЗАПИСИ ПОЛЬЗОВАТЕЛЕМ**)

### Запуск web-части

```
python3 devserver.py
```

### Запуск сервиса конвертации

```
python3 start_conv.py
```

Запущенный сервер будет доступен по адресу http://localhost:4501/

Логин - `admin`
Пароль - `equirectangular`