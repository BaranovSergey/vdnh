// src/store/camerasSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = 'http://localhost:5001/api/cameras'

// Thunk для получения камер
export const fetchCameras = createAsyncThunk(
  'cameras/fetchCameras',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL)
      // Маппим данные: если сервер возвращает rtspUrl, используем его, иначе (если rtspurl) – подставляем
      return response.data.map((camera) => ({
        id: camera.id,
        rtspUrl: camera.rtspUrl || camera.rtspurl, // убедитесь, что здесь корректное имя поля
        start: camera.start || {
          lat: Number(camera.lat),
          lng: Number(camera.lng),
        },
      }))
    } catch (err) {
      return rejectWithValue(err.response.data)
    }
  }
)

// Thunk для добавления одной камеры
export const addCameraToAPI = createAsyncThunk(
  'cameras/addCamera',
  async ({ rtspUrl, start }, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, {
        rtspUrl,
        lat: start.lat,
        lng: start.lng,
      })
      const data = response.data
      if (!data.start) {
        data.start = { lat: Number(data.lat), lng: Number(data.lng) }
      }
      return data
    } catch (err) {
      return rejectWithValue(err.response.data)
    }
  }
)

// Thunk для массового добавления камер (если используете его)
export const addCamerasToAPI = createAsyncThunk(
  'cameras/addCameras',
  async (cameras, { rejectWithValue }) => {
    try {
      const responses = await Promise.all(
        cameras.map((camera) =>
          axios.post(API_URL, {
            rtspUrl: camera.rtspUrl,
            lat: camera.start.lat,
            lng: camera.start.lng,
          })
        )
      )
      const addedCameras = responses.map((response) => {
        const data = response.data
        if (!data.start) {
          data.start = { lat: Number(data.lat), lng: Number(data.lng) }
        }
        return data
      })
      return addedCameras
    } catch (err) {
      return rejectWithValue(err.response.data)
    }
  }
)

// Thunk для удаления камеры (если нужен)
export const deleteCameraFromAPI = createAsyncThunk(
  'cameras/deleteCamera',
  async (id, { rejectWithValue }) => {
    try {
      await axios.delete(`${API_URL}/${id}`)
      return id
    } catch (err) {
      return rejectWithValue(err.response.data)
    }
  }
)

const camerasSlice = createSlice({
  name: 'cameras',
  initialState: {
    cameraViews: [],
    status: 'idle',
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Получение камер
      .addCase(fetchCameras.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchCameras.fulfilled, (state, action) => {
        state.status = 'succeeded'
        state.cameraViews = action.payload
      })
      .addCase(fetchCameras.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      // Добавление одной камеры
      .addCase(addCameraToAPI.fulfilled, (state, action) => {
        state.cameraViews.push(action.payload)
      })
      // Массовое добавление камер
      .addCase(addCamerasToAPI.fulfilled, (state, action) => {
        state.cameraViews.push(...action.payload)
      })
      // Удаление камеры
      .addCase(deleteCameraFromAPI.fulfilled, (state, action) => {
        state.cameraViews = state.cameraViews.filter(
          (camera) => camera.id !== action.payload
        )
      })
  },
})

export default camerasSlice.reducer
