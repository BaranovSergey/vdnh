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
  cameraIP,
  setCameraIP,
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
        <Box mb={2}>Введите IP-адрес камеры.</Box>
        <TextField
          label="IP-адрес"
          fullWidth
          value={cameraIP}
          onChange={(e) => setCameraIP(e.target.value)}
          margin="normal"
          autoFocus
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
          disabled={!cameraIP.trim()}
        >
          Добавить
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddCameraDialog
