const STORAGE_KEY = 'todo_app_items_v1'
const FILTER_KEY = 'todo_app_filter_v1'

// PUBLIC_INTERFACE
export function loadTodos() {
  /** Loads todos array from localStorage */
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

// PUBLIC_INTERFACE
export function saveTodos(items) {
  /** Saves todos array to localStorage */
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  } catch {
    /* ignore */
  }
}

// PUBLIC_INTERFACE
export function loadFilter() {
  /** Loads current filter from localStorage */
  try {
    const raw = localStorage.getItem(FILTER_KEY)
    return raw || 'all'
  } catch {
    return 'all'
  }
}

// PUBLIC_INTERFACE
export function saveFilter(filter) {
  /** Saves current filter to localStorage */
  try {
    localStorage.setItem(FILTER_KEY, filter)
  } catch {
    /* ignore */
  }
}

// PUBLIC_INTERFACE
export function generateId() {
  /** Generates a simple unique id string */
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
