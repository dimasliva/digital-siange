import { formatBytes } from "../func"

export async function delFile(id) {
  const resp = await fetch("/api/files/del", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "filename": id,
    })
  })
  return resp
}
export async function moveToFolder(folderId, id) {
  const resp = await fetch("/api/files/move_multiple", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "folder": folderId,
      "files": id,
    })
  })
  const res = await resp.json() 
  return res
}
export async function makeDir(title, parent) {
  let resp = await fetch("/api/files/makedir", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "name": title,
      "parent": parent,
    })
  })
  let res = await resp.json()
  return res
}
export async function fileRename(id, title) {
  let resp = await fetch("/api/files/rename", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "id": id,
      "name": title,
    })
  })
  let res = await resp.json()
  return res
}
export async function folderRename(id, title) {
  let resp = await fetch("/api/files/renamedir", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "id": id,
      "name": title,
    })
  })
  let res = await resp.json()
  return res
}
export async function fileUpload(file) {
  let resp = await fetch("/api/files/upload", {
    method: 'POST',
    body: file
  })
  let res = await resp.json()
  return res
}
export async function getFiles(id) {
  let res;
  if(id) {
    res = await fetch("/api/files/list" + '?folder=' + id)
  } else {
    res = await fetch("/api/files/list")
  }
  let resp = await res.json()
  return resp
}