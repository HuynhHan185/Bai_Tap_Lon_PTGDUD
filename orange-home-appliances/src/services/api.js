const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

// Helper: get token from localStorage
function getToken() {
  return localStorage.getItem('accessToken')
}

// Helper: parse JSON response
async function parseResponse(res) {
  const data = await res.json()
  if (!res.ok) {
    const message = data?.message || 'Đã xảy ra lỗi'
    throw new Error(message)
  }
  return data
}

// Generic fetch with auth support
async function fetchApi(path, options = {}) {
  const token = getToken()
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  return parseResponse(res)
}

// ==================== AUTH ====================

export async function login(email, mat_khau) {
  const data = await fetchApi('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, mat_khau }),
  })

  // Save token and user to localStorage
  localStorage.setItem('accessToken', data.accessToken)
  localStorage.setItem('user', JSON.stringify(data.user))
  return data
}

export async function register(payload) {
  const data = await fetchApi('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  localStorage.setItem('accessToken', data.accessToken)
  localStorage.setItem('user', JSON.stringify(data.user))
  return data
}

export async function getMe() {
  return fetchApi('/auth/me')
}

export async function logout() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('user')
}

export async function forgotPassword(email) {
  return fetchApi('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  })
}

export async function resetPassword(token, mat_khau_moi) {
  return fetchApi('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, mat_khau_moi }),
  })
}

// ==================== USER PROFILE ====================

export async function getMyProfile() {
  return fetchApi('/users/me/profile')
}

export async function updateMyProfile(payload) {
  return fetchApi('/users/me/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export async function changePassword(mat_khau_cu, mat_khau_moi) {
  return fetchApi('/users/me/password', {
    method: 'PUT',
    body: JSON.stringify({ mat_khau_cu, mat_khau_moi }),
  })
}

// ==================== PRODUCTS ====================

export async function getProducts(params = {}) {
  const sp = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      sp.set(key, value)
    }
  })
  return fetchApi(`/products?${sp.toString()}`)
}

export async function getProductBySlug(slug) {
  const data = await fetchApi(`/products/slug/${slug}`)
  return data.product
}

export async function getFeaturedProducts() {
  const data = await fetchApi('/products/featured')
  return data.products
}

export async function getRelatedProducts(productId) {
  const data = await fetchApi(`/products/related/${productId}`)
  return data.products
}

// ==================== CATEGORIES ====================

export async function getCategories() {
  const data = await fetchApi('/categories')
  return data.categories
}

export async function getCategoryBySlug(slug) {
  const data = await fetchApi(`/categories/${slug}`)
  return data.category
}

// ==================== ORDERS ====================

export async function createOrder(payload) {
  return fetchApi('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function getMyOrders() {
  return fetchApi('/orders/my-orders')
}

export async function getOrderDetail(id) {
  return fetchApi(`/orders/${id}`)
}

export async function cancelOrder(id, ly_do_huy) {
  return fetchApi(`/orders/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ ly_do_huy }),
  })
}

// ==================== CONTACTS ====================

export async function createContact(payload) {
  return fetchApi('/contacts', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

// ==================== BANNERS ====================

export async function getBanners() {
  const data = await fetchApi('/banners')
  return data.banners
}

// ==================== REVIEWS ====================

export async function getReviewsByProduct(productId, page = 1, limit = 10) {
  return fetchApi(`/reviews/product/${productId}?page=${page}&limit=${limit}`)
}

export async function createReview(payload) {
  return fetchApi('/reviews', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function deleteReview(id) {
  return fetchApi(`/reviews/${id}`, { method: 'DELETE' })
}

// ==================== PROMOTIONS ====================

export async function validateCoupon(code, tong_tien) {
  return fetchApi('/promotions/validate', {
    method: 'POST',
    body: JSON.stringify({ code, tong_tien }),
  })
}

export async function getActivePromotions() {
  const data = await fetchApi('/promotions')
  return data.promotions
}

// ==================== ADMIN API ====================

export async function apiFetch(path, options = {}) {
  return fetchApi(path, options)
}

// Admin: Orders
export async function getAllOrders(params = {}) {
  const sp = new URLSearchParams(params)
  return fetchApi(`/orders/admin?${sp.toString()}`)
}

export async function updateOrderStatus(id, data) {
  return fetchApi(`/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteOrder(id) {
  return fetchApi(`/orders/${id}`, { method: 'DELETE' })
}

// Admin: Products
export async function getAdminProducts() {
  const data = await fetchApi('/products/admin/all')
  return data.products
}

export async function createProduct(data) {
  return fetchApi('/products', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateProduct(id, data) {
  return fetchApi(`/products/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteProduct(id) {
  return fetchApi(`/products/${id}`, { method: 'DELETE' })
}

export async function uploadProductImage(file) {
  const token = getToken()
  const formData = new FormData()
  formData.append('image', file)

  const res = await fetch(`${API_URL}/products/upload-image`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  })

  return parseResponse(res)
}

// Admin: Categories
export async function getAdminCategories() {
  return getCategories() // Same endpoint
}

export async function createCategory(data) {
  return fetchApi('/categories', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateCategory(id, data) {
  return fetchApi(`/categories/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteCategory(id) {
  return fetchApi(`/categories/${id}`, { method: 'DELETE' })
}

// Admin: Users
export async function getAdminUsers() {
  const data = await fetchApi('/users/admin')
  return data.users
}

// Admin: Contacts
export async function getAdminContacts(params = {}) {
  const sp = new URLSearchParams(params)
  return fetchApi(`/contacts/admin?${sp.toString()}`)
}

export async function replyContact(id, tra_loi) {
  return fetchApi(`/contacts/${id}/reply`, {
    method: 'PATCH',
    body: JSON.stringify({ tra_loi }),
  })
}

// Admin: Banners
export async function getAdminBanners() {
  const data = await fetchApi('/banners/admin')
  return data.banners
}

export async function createBanner(data) {
  return fetchApi('/banners', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateBanner(id, data) {
  return fetchApi(`/banners/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function deleteBanner(id) {
  return fetchApi(`/banners/${id}`, { method: 'DELETE' })
}

// Admin: Promotions
export async function getAdminPromotions() {
  const data = await fetchApi('/promotions/admin')
  return data.promotions
}

export async function createPromotion(data) {
  return fetchApi('/promotions', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function generatePromotionCodes(promotionId, data) {
  return fetchApi(`/promotions/${promotionId}/codes`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function deletePromotion(id) {
  return fetchApi(`/promotions/${id}`, { method: 'DELETE' })
}
