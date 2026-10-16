// Persist the last selected place so the home screen can offer a shortcut.

const KEY = 'offertoday.lastPlace'

export function getLastPlace() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setLastPlace(place) {
  try {
    if (place && place._id) {
      localStorage.setItem(KEY, JSON.stringify({ _id: place._id, name: place.name }))
    }
  } catch {
    // Storage unavailable (private mode, etc.) — the shortcut is optional.
  }
}
