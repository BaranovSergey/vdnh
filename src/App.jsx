import React, { useState, useRef, useEffect } from 'react'
import './App.css'
import Navbar from './widgets/Navbar/Navbar'
import CameraMap from './widgets/CameraMap/CameraMap'
import CameraDrawer from './widgets/CameraDrawer/CameraDrawer'
import AddCameraDialog from './widgets/CameraDialog/AddCameraDialog'
import VideoDialog from './widgets/CameraDialog/VideoDialog'
import DeleteCameraDialog from './widgets/CameraDialog/DeleteCameraDialog'
import AddCameraByCoordsDialog from './widgets/CameraDialog/AddCameraByCoordsDialog'
import { Snackbar, Alert } from '@mui/material'

function App() {
  const [point, setPoint] = useState(null)
  const [direction, setDirection] = useState(null)
  const [cameraViews, setCameraViews] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [cameraUrl, setCameraUrl] = useState('')
  const [search, setSearch] = useState('')
  const [highlightedCamera, setHighlightedCamera] = useState(null)
  const [iconColor, setIconColor] = useState('black')
  const mapRef = useRef(null)

  // Для видео диалога
  const [openVideoDialog, setOpenVideoDialog] = useState(false)
  const [cameraForVideo, setCameraForVideo] = useState(null)

  // Для диалога добавления камер по координатам
  const [openAddByCoordsDialog, setOpenAddByCoordsDialog] = useState(false)
  const [cameraUrlByCoords, setCameraUrlByCoords] = useState('')
  const [coordinates, setCoordinates] = useState({ lat: '', lng: '' })
  const [fileError, setFileError] = useState('')

  // Для диалога удаления
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [cameraToDelete, setCameraToDelete] = useState(null)

  // Для Snackbar с новыми камерами
  const [newCameras, setNewCameras] = useState([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [hovered, setHovered] = useState(false)

  // Для моргания маркера
  const [blinkingCamera, setBlinkingCamera] = useState(null)

  // Функция для открытия диалога добавления камер по координатам
  const handleOpenAddByCoordsDialog = () => {
    setOpenAddByCoordsDialog(true)
  }

  // Функция для закрытия диалога добавления камер по координатам
  const handleCloseAddByCoordsDialog = () => {
    setOpenAddByCoordsDialog(false)
    setCameraUrlByCoords('')
    setCoordinates({ lat: '', lng: '' })
    setFileError('') // Очищаем ошибку
  }

  // Добавление камеры по координатам
  const handleAddCameraByCoords = (camera) => {
    setCameraViews((prev) => [...prev, camera])
  }

  // Добавление камер из файла
  const handleAddCamerasByFile = (cameras) => {
    setCameraViews((prev) => [...prev, ...cameras])
    setNewCameras(cameras) // Сохраняем новые камеры для Snackbar
    setSnackbarOpen(true) // Открываем Snackbar
  }

  // Открытие диалога удаления
  const handleOpenDeleteDialog = (camera) => {
    setCameraToDelete(camera) // Сохраняем информацию о камере
    setOpenDeleteDialog(true) // Открываем диалог
  }

  // Закрытие диалога удаления
  const handleCloseDeleteDialog = () => {
    setCameraToDelete(null) // Очищаем текущую камеру
    setOpenDeleteDialog(false) // Закрываем диалог
  }

  // Подтверждение удаления камеры
  const handleConfirmDeleteCamera = () => {
    setCameraViews((prev) =>
      prev.filter(
        (existingCamera) => existingCamera.rtspUrl !== cameraToDelete.rtspUrl
      )
    )
    setCameraToDelete(null) // Очищаем текущую камеру
    setOpenDeleteDialog(false) // Закрываем диалог
  }

  // Обработчик клавиши "Escape"
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (openDialog) {
          setOpenDialog(false) // Закрытие диалога добавления камеры
        } else if (point || direction) {
          setPoint(null) // Сброс точки выбора
          setDirection(null) // Сброс направления
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown) // Добавление обработчика события
    return () => {
      window.removeEventListener('keydown', handleKeyDown) // Очистка обработчика при размонтировании
    }
  }, [openDialog, point, direction])

  // Открытие видео по двойному клику
  const handleOpenVideoDialog = (camera) => {
    setCameraForVideo(camera)
    setOpenVideoDialog(true)
  }

  const handleCloseVideoDialog = () => {
    setCameraForVideo(null)
    setOpenVideoDialog(false)
  }

  // Добавление камеры через диалог
  const handleAddCamera = () => {
    if (cameraUrl.trim() && point && direction) {
      const newCamera = {
        start: point,
        end: direction,
        rtspUrl: cameraUrl.trim(),
      }

      // Проверяем, существует ли уже такая камера
      const existingCamera = cameraViews.find(
        (camera) =>
          camera.rtspUrl === newCamera.rtspUrl &&
          camera.start.lat === newCamera.start.lat &&
          camera.start.lng === newCamera.start.lng
      )

      if (existingCamera) {
        setFileError('Камера с такими координатами уже существует.')
        return
      }

      setCameraViews((prev) => [...prev, newCamera])
      setCameraUrl('')
      setPoint(null)
      setDirection(null)
      setOpenDialog(false)
    }
  }

  // Получение количества камер
  const cameraCount = cameraViews.length

  // Закрытие Snackbar
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    if (!hovered) {
      setSnackbarOpen(false)
    }
  }

  // Обработка наведения мыши на Snackbar
  const handleMouseEnter = () => {
    setHovered(true)
  }

  // Обработка ухода мыши с Snackbar
  const handleMouseLeave = () => {
    setHovered(false)
  }

  // Функция для начала моргания маркера
  const startBlinkingMarker = (camera) => {
    setBlinkingCamera(camera)
    const timer = setInterval(() => {
      setIconColor((prevColor) => (prevColor === 'black' ? 'red' : 'black'))
    }, 500)
    setTimeout(() => {
      clearInterval(timer)
      setBlinkingCamera(null)
      setIconColor('black')
    }, 3000)
  }

  return (
    <div style={{ height: '100vh' }}>
      <Navbar
        onMenuClick={() => setDrawerOpen(true)}
        onAddByCoordsClick={handleOpenAddByCoordsDialog}
        cameraCount={cameraCount} // Передаем количество камер
      />
      <AddCameraByCoordsDialog
        openDialog={openAddByCoordsDialog}
        handleDialogClose={handleCloseAddByCoordsDialog}
        handleAddCamerasByFile={handleAddCamerasByFile}
        handleAddCameraByCoords={handleAddCameraByCoords}
        cameraViews={cameraViews} // Передаем существующие камеры
        fileError={fileError} // Передаем ошибку
        setFileError={setFileError} // Передаем функцию для установки ошибки
      />
      <div style={{ marginTop: 64, height: 'calc(100% - 64px)' }}>
        <CameraMap
          point={point}
          direction={direction}
          setPoint={setPoint}
          setDirection={setDirection}
          cameraViews={cameraViews}
          highlightedCamera={highlightedCamera}
          iconColor={iconColor}
          mapRef={mapRef}
          openDialog={openDialog}
          handleDialogOpen={() => setOpenDialog(true)}
          handleOpenVideoDialog={handleOpenVideoDialog}
          blinkingCamera={blinkingCamera} // Передаем текущий моргающий маркер
        />
      </div>

      <CameraDrawer
        drawerOpen={drawerOpen}
        onCloseDrawer={() => setDrawerOpen(false)}
        cameraViews={cameraViews}
        highlightedCamera={highlightedCamera}
        iconColor={iconColor}
        search={search}
        setSearch={setSearch}
        handleDeleteCamera={handleOpenDeleteDialog} // Открытие диалога удаления
        startBlinkingMarker={startBlinkingMarker} // Передаем функцию для начала моргания маркера
        blinkingCamera={blinkingCamera} // Передаем текущий моргающий маркер
      />

      <AddCameraDialog
        openDialog={openDialog}
        handleDialogClose={() => {
          setOpenDialog(false)
          setPoint(null)
          setDirection(null)
        }}
        cameraUrl={cameraUrl}
        setCameraUrl={setCameraUrl}
        handleAddCamera={handleAddCamera}
      />

      {openVideoDialog && (
        <VideoDialog
          key={cameraForVideo?.rtspUrl || 'default'}
          open={openVideoDialog}
          onClose={handleCloseVideoDialog}
          camera={cameraForVideo}
        />
      )}

      <DeleteCameraDialog
        open={openDeleteDialog}
        camera={cameraToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDeleteCamera}
      />

      {/* Snackbar для отображения новых камер */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        ContentProps={{
          sx: {
            width: '50vw', // Ширина Snackbar составляет 50% от ширины экрана
            maxWidth: '50vw', // Максимальная ширина
          },
        }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: '100%', maxHeight: '50vh', overflowY: 'auto' }} // Ограничение высоты и добавление прокрутки
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
    </div>
  )
}

export default App
