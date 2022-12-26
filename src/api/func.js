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
export function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

export function formatDate(date) {
  return [
    padTo2Digits(date.getDate()),
    padTo2Digits(date.getMonth() + 1),
    date.getFullYear(),
  ].join('/');
}

export function formatAMPM(date) {
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? '0'+minutes : minutes;
  var strTime = hours + ':' + minutes + ' ' + ampm;
  return strTime;
}

export async function updateSub(content, id) {
  const resp = await fetch("/api/subs/update", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "content": content,
      "player": id,
    })
  })
  return await resp.json()
}
export async function getPlayerStatus(id) {
  const res = await fetch(`/api/players/${id}/status`, {
    method: 'GET',
  })
  const resp = await res.json()
  return {device: resp.data, stats: resp.data.stats}
}
export async function removeCmd(id) {
  const resp = await fetch("/api/players/remotecmd/delete", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "requestId": id,
    })
  })
  return resp
}
export function formatBytes(bytes, decimals = 2) {
  if (!+bytes) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}
export async function getSubs() {
  const res = await fetch("/api/subs/list")
    let resp = await res.json()
    let lists = resp.result
  return lists
}
export async function includePlayer(groupId, playerId) {
  let resp = await fetch("/api/groups/include", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "group": groupId,
      "player": playerId,
    })
  })
  let res = await resp.json()
  return res
}
export async function groupAssign(groupId, scheduleId) {
  let resp = await fetch("/api/groups/assign", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "group": groupId,
      "schedule": scheduleId,
    })
  })
  let res = await resp.json()
  return res
}
export async function copySchedule(scheduleId, copyName) {
  let resp = await fetch("/api/schedules/copy", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "schedule": scheduleId,
      "copy_name": copyName,
    })
  })
  let res = await resp.json()
  return res
}
export async function delSchedule(id) {
  let resp = await fetch("/api/schedules/remove", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "schedule": id,
    })
  })
  let res = await resp.json()
  return res
}
export function DateFormatter(text){
	return (new Date(parseInt(text)*1000)).toLocaleString();
}
export async function getPlayers() {
  let resp = await fetch("/api/players/list", {
    method: 'GET',
  })
  let res = await resp.json()
  return res.result
}
export function setCookie(name,value,days) {
  var expires = "";
  if (days) {
      var date = new Date();
      date.setTime(date.getTime() + (days*24*60*60*1000));
      expires = "; expires=" + date.toUTCString();
  }
  document.cookie = name + "=" + (value || "")  + expires + "; path=/";
}
export function getCookie(name) {
  var nameEQ = name + "=";
  var ca = document.cookie.split(';');
  for(var i=0;i < ca.length;i++) {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1,c.length);
      if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
  }
  return null;
}
export function eraseCookie(name) {   
  document.cookie = name +'=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;';
}
export async function downloadFile(item) {
  const image = await fetch(item.id.split('.')[item.id.split('.').length - 1] === 'mp4' ? '/media/' + item.id : '/thumb/' + item.id + '.jpg')
  const imageBlog = await image.blob();
  const imageUrl = URL.createObjectURL(imageBlog)

  const anchor = document.createElement("a")
  console.log(imageUrl)
  anchor.href = imageUrl
  anchor.download = item.id

  document.body.append(anchor)
  anchor.click()
  document.body.removeChild(anchor)
}
export async function delFile(id) {   
  let res = await fetch("/api/files/del", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "filename": id,
    })
  })
  let resp = await res.json()
  return resp
}
export async function delFolder(id) {   
  let res = await fetch("/api/files/removedir", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "id": id,
    })
  })
  let resp = await res.json()
  return resp
}
export async function getStatusFiles(){
    let resp = await fetch("/api/files/status", {
      method: 'GET',
    })
		var res = await resp.json();
    return res.data
}
export function DateDifference(text){
	var result = '';
	var now = new Date();
	var then = new Date(parseInt(text)*1e3);
	var days = Math.floor((now - then)/86400000);
	var hours = Math.floor((now - then)/3600000)%24;
	var minutes = Math.floor((now - then)/60000)%60;
	if(hours < 0){
		result = translated('time_now');
	} else if(days != 0){
		result = days + ' ' + NumericL11n(days, translated('time_day')[0], translated('time_day')[1], translated('time_day')[2]) + ' ' + hours + ' ' + NumericL11n(hours, translated('time_hour')[0], translated('time_hour')[1], translated('time_hour')[2]) + ' ' + minutes + ' ' + NumericL11n(minutes, translated('time_minute')[0], translated('time_minute')[1], translated('time_minute')[2]) + ' ' + translated('time_ago');
	} else if(hours != 0){
		result = hours + ' ' + NumericL11n(hours, translated('time_hour')[0], translated('time_hour')[1], translated('time_hour')[2]) + ' ' + minutes + ' ' + NumericL11n(minutes, translated('time_minute')[0], translated('time_minute')[1], translated('time_minute')[2]) + ' ' + translated('time_ago');
	} else if(minutes != 0){
		result = minutes + ' ' + NumericL11n(minutes, translated('time_minute')[0], translated('time_minute')[1], translated('time_minute')[2]) + ' ' + translated('time_ago');
	} else {
		result = translated('time_now');
	}
	return result;
}
function translated(key ){
  if(key in locale){
      return locale[key];
  } else {
      return key;
  }
}
function NumericL11n(num, one, two, five){
	if(num > 4 && num < 20){
		return five;
	} else {
		switch(num % 10){
		case 1:
			return one;
			break;
		case 2:
		case 3:
		case 4:
			return two;
			break;
		default:
			return five;
		}
	}
}