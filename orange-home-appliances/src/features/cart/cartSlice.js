import { createSlice } from '@reduxjs/toolkit'

const loadCart = () => {
  try {
    return JSON.parse(localStorage.getItem('orange_cart')) || { items: [] }
  } catch {
    return { items: [] }
  }
}

const saveCart = (state) => {
  localStorage.setItem('orange_cart', JSON.stringify(state))
}

// Normalize product item to always have id, name, price, image
function normalizeItem(item) {
  return {
    ...item,
    id: item.ma_sp || item.id,
    name: item.ten_sp || item.name,
    price: item.don_gia || item.price,
    image: item.hinh_anh || item.image || null,
  }
}

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCart(),
  reducers: {
    addToCart(state, action) {
      const raw = normalizeItem(action.payload)
      const existed = state.items.find((x) => x.id === raw.id)

      if (existed) {
        existed.quantity += raw.quantity || 1
      } else {
        state.items.push({
          ...raw,
          quantity: raw.quantity || 1,
        })
      }

      saveCart(state)
    },

    updateQty(state, action) {
      const { id, quantity } = action.payload
      const item = state.items.find((x) => x.id === id)

      if (item) {
        item.quantity = Math.max(1, quantity)
      }

      saveCart(state)
    },

    removeFromCart(state, action) {
      state.items = state.items.filter((x) => x.id !== action.payload)
      saveCart(state)
    },

    clearCart(state) {
      state.items = []
      saveCart(state)
    },
  },
})

export const { addToCart, updateQty, removeFromCart, clearCart } =
  cartSlice.actions

export const selectCartItems = (state) => state.cart.items

export const selectCartCount = (state) =>
  state.cart.items.reduce((sum, item) => sum + item.quantity, 0)

export const selectCartSubtotal = (state) =>
  state.cart.items.reduce(
    (sum, item) => sum + item.quantity * (item.price || 0),
    0,
  )

export default cartSlice.reducer
