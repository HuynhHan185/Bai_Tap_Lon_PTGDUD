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

const cartSlice = createSlice({
  name: 'cart',
  initialState: loadCart(),
  reducers: {
    addToCart(state, action) {
      const item = action.payload
      const existed = state.items.find((x) => x.id === item.id)

      if (existed) {
        existed.quantity += item.quantity || 1
      } else {
        state.items.push({
          ...item,
          quantity: item.quantity || 1,
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
    (sum, item) => sum + item.quantity * item.price,
    0,
  )

export default cartSlice.reducer