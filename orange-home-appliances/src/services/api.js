const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

async function request(path) {
  const res = await fetch(`${API_URL}${path}`)

  if (!res.ok) {
    throw new Error('API error')
  }

  return res.json()
}

export async function getProducts(params = {}) {
  const sp = new URLSearchParams()

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      sp.set(key, value)
    }
  })

  return request(`/products?${sp.toString()}`)
}

export async function getProductBySlug(slug) {
  const rows = await request(`/products?slug=${slug}`)
  return rows?.[0] || null
}

export async function getCategories() {
  return request('/categories')
}

export async function createOrder(payload) {
  const res = await fetch(`${API_URL}/orders`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return res.json()
}

export async function createContact(payload) {
  const res = await fetch(`${API_URL}/contactMessages`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  })

  return res.json()
}

export async function login(email, password) {
  const users = await request(`/users?email=${encodeURIComponent(email)}`)
  const user = users?.[0]
  
  if (!user || user.password !== password) {
    throw new Error('Email hoặc mật khẩu không đúng')
  }
  
  // Create a fake token
  return {
    token: `fake-jwt-token-${user.id}`,
    user
  }
}

export async function register(payload) {
  const existing = await request(`/users?email=${encodeURIComponent(payload.email)}`)
  if (existing && existing.length > 0) {
    throw new Error('Email đã được sử dụng')
  }
  
  const newUser = {
    ...payload,
    id: `usr-${Date.now()}`,
    role: 'customer'
  }
  
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(newUser),
  })
  
  const user = await res.json()
  return {
    token: `fake-jwt-token-${user.id}`,
    user
  }
}

// --- Admin REST API ---
export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) throw new Error('API request failed')
  return res.json()
}

export async function getAllOrders() { return apiFetch('/orders') }
export async function updateOrder(id, data) { return apiFetch(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(data) }) }
export async function deleteOrder(id) { return apiFetch(`/orders/${id}`, { method: 'DELETE' }) }

export async function createProduct(data) { return apiFetch('/products', { method: 'POST', body: JSON.stringify(data) }) }
export async function updateProduct(id, data) { return apiFetch(`/products/${id}`, { method: 'PATCH', body: JSON.stringify(data) }) }
export async function deleteProduct(id) { return apiFetch(`/products/${id}`, { method: 'DELETE' }) }

export async function createCategory(data) { return apiFetch('/categories', { method: 'POST', body: JSON.stringify(data) }) }
export async function updateCategory(id, data) { return apiFetch(`/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }) }
export async function deleteCategory(id) { return apiFetch(`/categories/${id}`, { method: 'DELETE' }) }

export async function getAllUsers() { return apiFetch('/users') }
export async function updateUser(id, data) { return apiFetch(`/users/${id}`, { method: 'PATCH', body: JSON.stringify(data) }) }
export async function deleteUser(id) { return apiFetch(`/users/${id}`, { method: 'DELETE' }) }