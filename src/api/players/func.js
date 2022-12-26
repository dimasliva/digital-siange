export async function getPlayers() {
  let res = await fetch("/api/players/list")
  let resp = await res.json()
  return resp
}
export async function updateTickers(content) {
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
  let res = await resp.json()
  return res
}
export async function playerRename(id, name) {
  let res = await fetch("/api/players/rename", {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name,
      player: id,
    })
  })
  let resp = await res.json()
  return resp
}