const BASE = import.meta.env.VITE_API_URL || '/api'
export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('ps_token')
  const res = await fetch(BASE + path, {
    method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: `Bearer ${token}` }) },
    body: body && JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Something went wrong')
  return data
}
export async function upload(files) {
  const fd = new FormData()
  ;[...files].forEach((f) => fd.append('images', f))
  const res = await fetch(BASE + '/upload', { method: 'POST', headers: { Authorization: `Bearer ${localStorage.getItem('ps_token')}` }, body: fd })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.message || 'Upload failed')
  return data.urls
}
