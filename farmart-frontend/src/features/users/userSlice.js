import { createSlice } from '@reduxjs/toolkit'


const initialState = { user: null, status: 'idle' }

const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUser(state, action) {
      state.user = action.payload
    },
    clearUser(state) {
      state.user = null
    },
  },
})