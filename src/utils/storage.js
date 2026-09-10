// Thin, failure-tolerant wrapper - private browsing can throw on writes.
const PREFIX = 'kk.'

export function readStorage(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(PREFIX + key)
    return raw === null ? fallback : JSON.parse(raw)
  } catch {
    return fallback
  }
}

export function writeStorage(key, value) {
  try {
    window.localStorage.setItem(PREFIX + key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function removeStorage(key) {
  try {
    window.localStorage.removeItem(PREFIX + key)
  } catch {
    /* ignore */
  }
}

export const STORAGE_KEYS = {
  TOKEN: 'auth.token',
  USER: 'auth.user',
  MOCK_DB: 'mock.db',
}
