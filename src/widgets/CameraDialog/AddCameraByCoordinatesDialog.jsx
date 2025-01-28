import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@mui/material'

function AddCameraByCoordinatesDialog({ open, onClose, onAddCamera }) {
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')
  const [url, setUrl] = useState('')

  const handleSubmit = () => {
    if (!latitude || !longitude || !url) {
      alert('Все поля должны быть заполнены!')
      return
    }

    // Проверяем, что введены числа в широте и долготе
    if (isNaN(latitude) || isNaN(longitude)) {
      alert('Широта и долгота должны быть числами!')
      return
    }

    onAddCamera(parseFloat(latitude), parseFloat(longitude), url.trim())
    setLatitude('')
    setLongitude('')
    setUrl('')
    onClose()
  }

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Добавить камеру по координатам</DialogTitle>
      <DialogContent>
        <TextField
          label="Широта (Latitude)"
          type="text" // Убрали type="number", чтобы убрать счётчики
          value={latitude}
          onChange={(e) => setLatitude(e.target.value)}
          fullWidth
          margin="normal"
          inputProps={{ pattern: '^-?[0-9]*\\.?[0-9]*$' }} // Валидация ввода
        />
        <TextField
          label="Долгота (Longitude)"
          type="text" // Убрали type="number", чтобы убрать счётчики
          value={longitude}
          onChange={(e) => setLongitude(e.target.value)}
          fullWidth
          margin="normal"
          inputProps={{ pattern: '^-?[0-9]*\\.?[0-9]*$' }} // Валидация ввода
        />
        <TextField
          label="RTSP URL"
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary">
          Отмена
        </Button>
        <Button onClick={handleSubmit} color="primary" variant="contained">
          Добавить
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddCameraByCoordinatesDialog
