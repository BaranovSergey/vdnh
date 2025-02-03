import React from 'react'
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Box,
  TextField,
} from '@mui/material'

function AddCameraDialog({
  openDialog,
  handleDialogClose,
  cameraUrl,
  setCameraUrl,
  handleAddCamera,
}) {
  return (
    <Dialog
      open={openDialog}
      onClose={handleDialogClose}
      onKeyDown={(e) => {
        if (e.key === 'Enter') {
          handleAddCamera()
        }
      }}
    >
      <DialogTitle>Добавить камеру</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          Введите RTSP-ссылку камеры (например,
          rtsp://operator:operator@10.0.190.6/live/619).
        </Box>
        <TextField
          label="Ссылка (RTSP)"
          fullWidth
          value={cameraUrl}
          onChange={(e) => setCameraUrl(e.target.value)}
          margin="normal"
          autoFocus
          placeholder="Введите RTSP ссылку камеры"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose} color="secondary">
          Отмена
        </Button>
        <Button
          onClick={handleAddCamera}
          variant="contained"
          color="primary"
          disabled={!cameraUrl.trim()}
        >
          Добавить
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddCameraDialog
