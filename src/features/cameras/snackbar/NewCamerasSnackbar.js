import React from 'react'
import { Snackbar, Alert } from '@mui/material'

const NewCamerasSnackbar = ({
  snackbarOpen,
  handleSnackbarClose,
  newCameras,
  handleMouseEnter,
  handleMouseLeave,
}) => {
  return (
    <Snackbar
      open={snackbarOpen}
      autoHideDuration={3000}
      onClose={handleSnackbarClose}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      ContentProps={{
        sx: {
          width: '40vw',
          maxWidth: '40vw',
        },
      }}
    >
      <Alert
        onClose={(e) => {
          e.stopPropagation()
          handleSnackbarClose()
        }}
        severity="success"
        sx={{ width: '100%', maxHeight: '50vh', overflowY: 'auto' }}
      >
        Добавлены новые камеры:
        <ul>
          {newCameras.map((camera, index) => (
            <li key={index}>
              {camera.rtspUrl} ({camera.start.lat.toFixed(4)},{' '}
              {camera.start.lng.toFixed(4)})
            </li>
          ))}
        </ul>
      </Alert>
    </Snackbar>
  )
}

export default NewCamerasSnackbar
