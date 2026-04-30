import { createSlice } from '@reduxjs/toolkit'
import { loadState, saveState, removeState } from '../../utils/storage'

const initialState = {
  user: loadState('user') || null,
  token: loadState('accessToken') || null,
  isAuthenticated: !!loadState('accessToken'),
}

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload.user
      state.token = action.payload.accessToken
      state.isAuthenticated = true

      saveState('user', state.user)
      saveState('accessToken', state.token)
    },
    logout(state) {
      state.user = null
      state.token = null
      state.isAuthenticated = false

      removeState('user')
      removeState('accessToken')
    },
  },
})

export const { setUser, logout } = userSlice.actions

export const selectUser = (state) => state.user.user
export const selectIsAuthenticated = (state) => state.user.isAuthenticated
export const selectToken = (state) => state.user.token

export default userSlice.reducer
