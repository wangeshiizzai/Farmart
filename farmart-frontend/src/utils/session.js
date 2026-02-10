export function getSessionUser() {
  try {
    const raw = sessionStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function isFarmerUser() {
  const user = getSessionUser()
  const type = user?.type || user?.role || ''
  return String(type).toLowerCase() === 'farmer'
}

export function getAuthToken() {
  try {
    return sessionStorage.getItem('token')
  } catch {
    return null
  }
}