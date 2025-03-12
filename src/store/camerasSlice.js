import { createSlice, createAsyncThunk } from '@reduxjs/toolkit'
import axios from 'axios'

const API_URL = 'http://localhost:5001/api/cameras'

// Получение камер с сервера
export const fetchCameras = createAsyncThunk(
  'cameras/fetchCameras',
  async (_, { rejectWithValue }) => {
    try {
      const response = await axios.get(API_URL)
      return response.data.map((camera) => ({
        id: camera.id,
        rtspUrl: camera.rtspUrl || camera.rtspurl,
        start: camera.start || {
          lat: Number(camera.lat),
          lng: Number(camera.lng),
        },
        online: camera.online,
        direction: camera.direction,
      }))
    } catch (err) {
      return rejectWithValue(err.response.data)
    }
  }
)

// Добавление одной камеры
export const addCameraToAPI = createAsyncThunk(
  'cameras/addCamera',
  async ({ rtspUrl, start, direction }, { rejectWithValue }) => {
    try {
      const response = await axios.post(API_URL, {
        rtspUrl,
        lat: start.lat,
        lng: start.lng,
        direction,
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

// Массовое добавление камер
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
            direction: camera.direction,
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

// Удаление камеры
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

// Обновление направления камеры
export const updateCameraDirection = createAsyncThunk(
  'cameras/updateCameraDirection',
  async ({ id, direction }, { rejectWithValue }) => {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, { direction })
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
      .addCase(addCameraToAPI.fulfilled, (state, action) => {
        state.cameraViews.push(action.payload)
      })
      .addCase(addCamerasToAPI.fulfilled, (state, action) => {
        state.cameraViews.push(...action.payload)
      })
      .addCase(deleteCameraFromAPI.fulfilled, (state, action) => {
        state.cameraViews = state.cameraViews.filter(
          (camera) => camera.id !== action.payload
        )
      })
      .addCase(updateCameraDirection.fulfilled, (state, action) => {
        const index = state.cameraViews.findIndex(
          (camera) => camera.id === action.payload.id
        )
        if (index !== -1) {
          state.cameraViews[index] = action.payload
        }
      })
  },
})

export default camerasSlice.reducer
