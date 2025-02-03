import { configureStore } from '@reduxjs/toolkit'
import camerasReducer from './camerasSlice'

const store = configureStore({
  reducer: {
    cameras: camerasReducer,
  },
})

export default store
