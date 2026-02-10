export function getSessionUser() {
  try {
    const raw = sessionStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}
