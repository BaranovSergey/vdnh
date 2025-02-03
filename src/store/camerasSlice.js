import { createSlice } from '@reduxjs/toolkit'

const initialState = {
  cameraViews: [],
}

const camerasSlice = createSlice({
  name: 'cameras',
  initialState,
  reducers: {
    addCamera: (state, action) => {
      const newCamera = action.payload
      const exists = state.cameraViews.some(
        (camera) =>
          camera.rtspUrl === newCamera.rtspUrl &&
          camera.start.lat === newCamera.start.lat &&
          camera.start.lng === newCamera.start.lng
      )
      if (!exists) {
        state.cameraViews.push(newCamera)
      }
    },
    addCameras: (state, action) => {
      action.payload.forEach((newCamera) => {
        const exists = state.cameraViews.some(
          (camera) =>
            camera.rtspUrl === newCamera.rtspUrl &&
            camera.start.lat === newCamera.start.lat &&
            camera.start.lng === newCamera.start.lng
        )
        if (!exists) {
          state.cameraViews.push(newCamera)
        }
      })
    },
    removeCamera: (state, action) => {
      state.cameraViews = state.cameraViews.filter(
        (camera) => camera.rtspUrl !== action.payload.rtspUrl
      )
    },
  },
})

export const { addCamera, addCameras, removeCamera } = camerasSlice.actions
export default camerasSlice.reducer
