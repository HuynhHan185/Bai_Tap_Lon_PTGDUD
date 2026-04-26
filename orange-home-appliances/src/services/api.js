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