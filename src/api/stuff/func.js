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
export async function groupExclude(groupId, playerId) {
  const resp = await fetch("/api/groups/exclude", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "group": groupId,
      "player": playerId
    })
  })
  const res = await resp.json() 
  return res
}