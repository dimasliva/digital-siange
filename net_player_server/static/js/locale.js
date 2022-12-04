var locale = {
    // -- schedules
    schedule_name_required: 'Введите название для расписания',
    schedule_required: 'Выберите расписание',
    schedule_saved: 'Расписание сохранено',
    schedule_exists: 'Расписание с таким названием уже существует',
    // -- players
    player_required: 'Выберите медиаплеер',
    player_name_required: 'Введите новое имя плеера',
    players_sort_schedule: 'Группировать по расписаниям',
    players_sort_accessed: 'Сортировать по последнему обращению',
    player_inactive: 'Не отвечает',
    players_next_schedule: 'устанавливается',
    // -- time
    time_now: 'сейчас',
    time_day: ['день','дня','дней'],
    time_hour: ['час','часа','часов'],
    time_minute: ['минута','минуты','минут'],
    time_ago: 'назад',
    // -- disk usage
    disk_free: 'Свободно',
    disk_content: 'Материалы',
    // -- schedule editor
    task_required: 'Выберите подзадачу',
    task_removed: 'Задача удалена',
    task_loaded: 'Задача загружена',
    task_video: 'Видеоролики',
    task_slideshow: 'Слайдшоу',
    task_web: 'Веб-страница',
    task_stream: 'Видеопоток',
    task_document: 'Документ',
    task_sleep: 'Спящий режим',
    task_default: 'Основная задача',
    task_web_example: 'Пример: http://site.ru/your-page.htm',
    custom_video_server: 'Ручной ввод адреса стрима',
    many_default_tasks: 'Основная задача должна быть одна',
    no_default_task: 'Не задана основная задача',
    // -- content
    upload_done: 'Загрузка завершена',
    upload_failed: 'Не удалось загрузить файл',
    upload_required: 'Выберите файлы для загрузки',
    file_remove_done: 'Файл удален',
    file_remove_failed: 'Не удалось удалить файл',
    file_required: 'Выберите файл',
    file_processing: 'Генерируется эскиз',
    rename_done: 'Файл переименован',
    rename_failed: 'Не удалось переименовать файл',
    create_folder_done: 'Папка создана',
    create_folder_failed: 'Не удалось создать папку',
    new_name_required: 'Необходимо ввести новое имя',
    failed_to_list_folders: 'Не удалось получить список папок',
    failed_to_list_files: 'Не удалось получить список файлов',
    // -- groups
    group_name_required: 'Введите название для группы',
    group_required: 'Выберите группу плееров',
    group_schedule_set: 'Расписание для группы установлено',
    group_create_done: 'Группа создана',
    group_create_failed: 'Не удалось создать группу',
    group_rename_done: 'Группа переименована',
    group_rename_failed: 'Не удалось переименовать группу',
    // -- headlines
    headlines_edit_empty: 'Выберите плеер',
    // -- fs
    username_required: 'Введите имя пользователя',
    password_required: 'Введите пароль',
    password_repeat: 'Повторите пароль',
    password_missmatch: 'Пароли в полях не совпадают',
    converting: 'Обработано файлов - ',
    // -- accessgroups
    privileges_admin: 'Администрирование',
    privileges_upload: 'Загрузка файлов',
    accessgroup_required: 'Выберите группу доступа',
    // -- requests
    request_schedule_failed: 'Не удалось применить расписание',
    request_generic_failed: 'Не удалось выполнить команду'
}
function translated(key){
    if(key in locale){
        return locale[key];
    } else {
        return key;
    }
}
