import React, { useState } from 'react'
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

function AddCameraByCoordsDialog({
  openDialog,
  handleDialogClose,
  handleAddCamerasByFile,
  handleAddCameraByCoords,
  cameraViews,
  fileError,
  setFileError,
}) {
  const [dragActive, setDragActive] = useState(false)
  const [cameraUrlByCoords, setCameraUrlByCoords] = useState('')
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' })
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [hovered, setHovered] = useState(false)

  // Обработка перетаскивания файла
  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  // Обработка загрузки файла
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.xlsx')) {
      handleFile(file)
    } else {
      setFileError('Пожалуйста, загрузите файл в формате .xlsx')
    }
  }

  // Чтение и обработка Excel-файла
  const handleFile = (file) => {
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
                `Некорректные данные в строке: ${JSON.stringify(
                  row
                )}. Ожидается RTSP и координаты.`
              )
            }
            const rtspUrl = row[0].trim()
            const coordinates = row[1].trim()
            const [latStr, lngStr] = coordinates.split(',')
            if (!latStr || !lngStr) {
              throw new Error(
                `Некорректные координаты: ${coordinates}. Ожидается два числа через запятую.`
              )
            }
            const lat = parseFloat(latStr)
            const lng = parseFloat(lngStr)
            if (isNaN(lat) || isNaN(lng)) {
              throw new Error(
                `Некорректные координаты: ${coordinates}. Не удалось преобразовать в числа.`
              )
            }
            return {
              rtspUrl,
              start: { lat, lng },
              end: null,
            }
          })

          // Фильтруем существующие камеры
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
  }

  // Добавление камеры по координатам
  const handleAddCameraByCoordsSubmit = () => {
    const lat = parseFloat(coordinates.lat)
    const lng = parseFloat(coordinates.lng)
    if (cameraUrlByCoords.trim() && !isNaN(lat) && !isNaN(lng)) {
      const newCamera = {
        rtspUrl: cameraUrlByCoords.trim(),
        start: { lat, lng },
        end: null,
      }

      const exists = cameraViews.find(
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
    if (!hovered) setSnackbarOpen(false)
  }

  const handleMouseEnter = () => setHovered(true)
  const handleMouseLeave = () => setHovered(false)

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

        {/* Дропзона для файла */}
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
            ...(dragActive && { borderColor: '#000' }),
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
                handleFile(file)
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

        {/* Форма для ручного ввода */}
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
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleSnackbarClose} severity="success">
          Камеры успешно добавлены!
        </Alert>
      </Snackbar>
    </Dialog>
  )
}

export default AddCameraByCoordsDialog
