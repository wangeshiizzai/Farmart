import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  items: [],
  status: 'idle',
}

const animalSlice = createSlice({
  name: 'animals',
  initialState,
  reducers: {
    setAnimals(state, action) {
      state.items = action.payload
    },
  },
})