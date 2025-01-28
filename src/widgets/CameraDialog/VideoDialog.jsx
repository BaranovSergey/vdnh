import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material'

function VideoDialog({ open, onClose, camera }) {
  // Функция для открытия потока в VLC
  const handleOpenInVLC = () => {
    const rtspUrl = camera?.rtspUrl
    if (!rtspUrl) {
      console.error('RTSP URL отсутствует.')
      return
    }

    // Прямая передача RTSP URL через window.location
    window.location.href = rtspUrl
    onClose()
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      PaperProps={{
        style: {
          width: 'auto', // Ширина окна подстраивается под содержимое
          maxWidth: '100%', // Максимальная ширина
        },
      }}
    >
      <DialogTitle>Видео с камеры</DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Поток RTSP: <strong>{camera?.rtspUrl || 'URL отсутствует'}</strong>
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleOpenInVLC} color="primary" variant="contained">
          Открыть в VLC
        </Button>
        <Button onClick={onClose} color="secondary">
          Закрыть
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default VideoDialog
