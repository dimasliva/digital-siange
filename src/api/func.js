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
export async function updateAllSubs(content) {
  const resp = await fetch("/api/subs/broadcast", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "content": content,
    })
  })
  return await resp.json()
}
export async function getPlayerStatus(id) {
  const res = await fetch(`/api/players/${id}/status`, {
    method: 'GET',
  })
  const resp = await res.json()
  resp.data.lastacc = formatDate(new Date(resp.data.lastacc)) + ', ' + formatAMPM(new Date(resp.data.lastacc))
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
export async function getFiles(id) {
  let res;
  if(id) {
    res = await fetch("/api/files/list" + '?folder=' + id)
  } else {
    res = await fetch("/api/files/list")
  }
  let lists = await res.json()
  let resp = lists.result
  resp.map(val => {
    val.size = formatBytes(val.size) 
  })
  console.log('resp', resp)
  return lists.result
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
export async function getGroups() {
  let res = await fetch("/api/groups/list")
  let lists = await res.json()
  return lists.result
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
export async function delGroup(groupId) {
  let resp = await fetch("/api/groups/remove", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "group": groupId,
    })
  })
  let res = await resp.json()
  return res
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