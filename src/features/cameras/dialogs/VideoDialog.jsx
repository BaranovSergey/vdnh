import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'

function VideoDialog({
  open,
  onClose,
  camera,
  onSetAngle,
  onSetMove,
  handleOpenInVLC,
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      PaperProps={{
        style: { width: 'auto', maxWidth: '100%' },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2, position: 'relative' }}>
        Видео с камеры
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'grey.500',
            '&:hover': {
              color: 'red',
            },
            padding: 1,
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography variant="body1">
          Поток RTSP: <strong>{camera?.rtspUrl || 'URL отсутствует'}</strong>
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center' }}>
        <Button
          onClick={() => onSetAngle(camera)}
          variant="contained"
          sx={{
            backgroundColor: '#87CEFA',
            '&:hover': {
              backgroundColor: '#ADD8E6',
            },
          }}
        >
          Угол обзора
        </Button>
        <Button
          onClick={() => onSetMove(camera)}
          variant="outlined"
          sx={{
            borderColor: 'grey',
            color: 'grey',
            '&:hover': {
              borderColor: 'darkgrey',
              color: 'darkgrey',
            },
          }}
        >
          Переместить
        </Button>
        <Button
          onClick={handleOpenInVLC}
          variant="contained"
          sx={{
            backgroundColor: 'orange',
            '&:hover': {
              backgroundColor: 'darkorange',
            },
          }}
        >
          Открыть в VLC
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default VideoDialog
