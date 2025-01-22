class LocalStorage {
  get(key, defaultValue = null) {
    const data = localStorage.getItem(key)
    if (data === undefined) return defaultValue
    let value
    try {
      value = JSON.parse(data)
    } catch (err) {
      console.error('error reading storage key:', key)
      value = null
    }
    if (value === undefined) return defaultValue
    return value || defaultValue
  }

  set(key, value) {
    if (value === undefined || value === null) {
      localStorage.removeItem(key)
    } else {
      const data = JSON.stringify(value)
      localStorage.setItem(key, data)
    }
  }

  remove(key) {
    localStorage.removeItem(key)
  }
}

const isBrowser = typeof window !== 'undefined'

if (!isBrowser) throw new Error('storage not available on the server')

// TODO: use a MemoryStorage fallback for browser environments that do not allow LocalStorage, eg safari private

export const storage = new LocalStorage()
