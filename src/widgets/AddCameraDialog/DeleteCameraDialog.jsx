import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
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
              Вы действительно хотите удалить камеру с IP: {camera.ip}?
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
        <Button onClick={onConfirm} color="primary" variant="contained">
          Удалить
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteCameraDialog
