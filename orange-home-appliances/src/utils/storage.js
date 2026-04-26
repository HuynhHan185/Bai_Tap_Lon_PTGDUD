export function loadState(key, fallbackValue) {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : fallbackValue
    } catch {
      return fallbackValue
    }
  }
  
  export function saveState(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch {
      // Bỏ qua nếu trình duyệt không cho lưu localStorage
    }
  }