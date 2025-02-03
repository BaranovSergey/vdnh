import React from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Typography,
} from '@mui/material'

function DeleteCameraDialog({ open, camera, onClose, onConfirm }) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Удаление камеры</DialogTitle>
      <DialogContent>
        {camera ? (
          <>
            <Typography>
              Вы действительно хотите удалить камеру с URL: {camera.rtspUrl}?
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Координаты: {camera.start.lat.toFixed(4)},{' '}
              {camera.start.lng.toFixed(4)}
            </Typography>
          </>
        ) : (
          <Typography>Камера не выбрана.</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Отмена
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteCameraDialog
