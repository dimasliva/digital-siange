export async function createGroup(name) {
  let res = await fetch("/api/groups/create", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "name": name,
    })
  })
  let resp = await res.json()
  return resp
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
export async function groupExclude(groupId, playerId) {
  const resp = await fetch("/api/groups/exclude", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      "group": Number(groupId),
      "player": playerId
    })
  })
  const res = await resp.json() 
  return res
}
export async function getGroups() {
  let res = await fetch("/api/groups/list")
  let resp = await res.json()
  resp.status
  return resp
}