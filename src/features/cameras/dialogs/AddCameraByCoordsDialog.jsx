import React, { useState, useCallback } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material'
import * as XLSX from 'xlsx'

const AddCameraByCoordsDialog = ({
  openDialog,
  handleDialogClose,
  handleAddCamerasByFile,
  handleAddCameraByCoords,
  cameraViews = [],
  fileError,
  setFileError,
  setNewCameras,
}) => {
  const [dragActive, setDragActive] = useState(false)
  const [cameraUrlByCoords, setCameraUrlByCoords] = useState('')
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' })
  const [snackbarOpen, setSnackbarOpen] = useState(false)

  const handleDrag = useCallback((e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(e.type === 'dragenter' || e.type === 'dragover')
  }, [])

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      const file = e.dataTransfer.files[0]
      if (file && file.name.endsWith('.xlsx')) {
        processFile(file)
      } else {
        setFileError('Пожалуйста, загрузите файл в формате .xlsx')
      }
    },
    [setFileError]
  )

  const processFile = useCallback(
    (file) => {
      const reader = new FileReader()
      reader.onload = (e) => {
        const data = new Uint8Array(e.target.result)
        const workbook = XLSX.read(data, { type: 'array' })
        const sheetName = workbook.SheetNames[0]
        const sheet = workbook.Sheets[sheetName]
        const json = XLSX.utils.sheet_to_json(sheet, { header: 1 })

        if (json.length > 0 && json[0].length >= 2) {
          try {
            const cameras = json.slice(1).map((row) => {
              if (!row[0] || !row[1]) {
                throw new Error(
                  `Некорректные данные в строке: ${JSON.stringify(row)}`
                )
              }
              const rtspUrl = row[0].trim()
              const coords = row[1].trim()
              const [latStr, lngStr] = coords.split(',')
              if (!latStr || !lngStr) {
                throw new Error(`Некорректные координаты: ${coords}`)
              }
              const lat = parseFloat(latStr)
              const lng = parseFloat(lngStr)
              if (isNaN(lat) || isNaN(lng)) {
                throw new Error(`Некорректные координаты: ${coords}`)
              }
              return {
                rtspUrl,
                start: { lat, lng },
                // Не передаём direction
              }
            })

            // Фильтруем уже добавленные камеры
            const existingUrls = new Set(
              cameraViews.map((camera) => camera.rtspUrl)
            )
            const newCameras = cameras.filter(
              (camera) => !existingUrls.has(camera.rtspUrl)
            )

            if (newCameras.length === 0) {
              setFileError('Все камеры уже добавлены.')
              return
            }

            handleAddCamerasByFile(newCameras)
            setSnackbarOpen(true)
            handleDialogClose()
          } catch (error) {
            setFileError(error.message)
          }
        } else {
          setFileError(
            'Неверный формат файла. Ожидается RTSP, Широта и Долгота через запятую.'
          )
        }
      }
      reader.readAsArrayBuffer(file)
    },
    [cameraViews, handleAddCamerasByFile, setFileError, handleDialogClose]
  )

  // Добавление камеры вручную
  const handleAddCameraByCoordsSubmit = () => {
    const lat = parseFloat(coordinates.lat)
    const lng = parseFloat(coordinates.lng)
    if (cameraUrlByCoords.trim() && !isNaN(lat) && !isNaN(lng)) {
      const newCamera = {
        rtspUrl: cameraUrlByCoords.trim(),
        start: { lat, lng },
        // direction не указываем
      }

      const exists = cameraViews.some(
        (camera) =>
          camera.rtspUrl === newCamera.rtspUrl &&
          camera.start.lat === newCamera.start.lat &&
          camera.start.lng === newCamera.start.lng
      )
      if (exists) {
        setFileError('Камера с такими координатами уже существует.')
        return
      }

      handleAddCameraByCoords(newCamera)
      handleDialogClose()
    } else {
      setFileError('Пожалуйста, заполните все поля корректно.')
    }
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return
    setSnackbarOpen(false)
    setNewCameras([])
  }

  return (
    <Dialog
      open={openDialog}
      onClose={handleDialogClose}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle>Добавить камеры</DialogTitle>
      <DialogContent>
        <Typography variant="body1" gutterBottom>
          Вы можете добавить камеры либо через загрузку файла Excel, либо
          вручную.
        </Typography>
        <Box
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          sx={{
            border: '2px dashed #ccc',
            borderRadius: '4px',
            padding: '20px',
            textAlign: 'center',
            cursor: 'pointer',
            marginBottom: '20px',
          }}
        >
          <input
            type="file"
            accept=".xlsx"
            style={{ display: 'none' }}
            id="file-input"
            onChange={(e) => {
              const file = e.target.files[0]
              if (file && file.name.endsWith('.xlsx')) {
                processFile(file)
                setTimeout(() => {
                  e.target.value = ''
                }, 0)
              } else {
                setFileError('Пожалуйста, загрузите файл в формате .xlsx')
              }
            }}
          />
          <label htmlFor="file-input">
            <Button variant="contained" component="span">
              Выберите файл
            </Button>
          </label>
        </Box>
        {fileError && (
          <Typography variant="body2" color="error" mt={2}>
            {fileError}
          </Typography>
        )}
        <Typography variant="h6" gutterBottom>
          Добавить камеру вручную
        </Typography>
        <TextField
          label="RTSP ссылка"
          value={cameraUrlByCoords}
          onChange={(e) => setCameraUrlByCoords(e.target.value)}
          margin="normal"
          fullWidth
          autoFocus
          placeholder="Введите RTSP ссылку камеры"
        />
        <TextField
          label="Широта"
          value={coordinates.lat}
          onChange={(e) =>
            setCoordinates((prev) => ({ ...prev, lat: e.target.value }))
          }
          margin="normal"
          fullWidth
          type="number"
          placeholder="Введите широту"
        />
        <TextField
          label="Долгота"
          value={coordinates.lng}
          onChange={(e) =>
            setCoordinates((prev) => ({ ...prev, lng: e.target.value }))
          }
          margin="normal"
          fullWidth
          type="number"
          placeholder="Введите долготу"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDialogClose}>Отмена</Button>
        <Button
          onClick={handleAddCameraByCoordsSubmit}
          variant="contained"
          color="primary"
        >
          Добавить камеру
        </Button>
      </DialogActions>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        ContentProps={{
          sx: { width: '40vw', maxWidth: '40vw' },
        }}
      >
        <Alert
          severity="success"
          action={
            <Button
              color="inherit"
              size="small"
              onClick={(e) => {
                e.stopPropagation()
                handleSnackbarClose()
              }}
            >
              ✖
            </Button>
          }
          sx={{ width: '100%', maxHeight: '50vh', overflowY: 'auto' }}
        >
          Камеры успешно добавлены!
        </Alert>
      </Snackbar>
    </Dialog>
  )
}

export default AddCameraByCoordsDialog
