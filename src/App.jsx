import React, { useState, useRef, useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Snackbar, Alert } from '@mui/material'
import Navbar from './features/layout/Navbar'
import CameraMap from './features/cameras/components/CameraMap'
import CameraDrawer from './features/cameras/components/CameraDrawer'
import AddCameraDialog from './features/cameras/dialogs/AddCameraDialog'
import VideoDialog from './features/cameras/dialogs/VideoDialog'
import DeleteCameraDialog from './features/cameras/dialogs/DeleteCameraDialog'
import AddCameraByCoordsDialog from './features/cameras/dialogs/AddCameraByCoordsDialog'
import { addCamera, addCameras, removeCamera } from './store/camerasSlice'
import './App.css'

function App() {
  // Если вы используете Redux, состояние списка камер берётся из сторa
  const cameraViews = useSelector((state) => state.cameras.cameraViews)
  const dispatch = useDispatch()

  // Локальные состояния для работы с диалогами и картой
  const [point, setPoint] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [cameraUrl, setCameraUrl] = useState('')
  const [search, setSearch] = useState('')
  const [iconColor, setIconColor] = useState('black')
  const mapRef = useRef(null)

  const [openVideoDialog, setOpenVideoDialog] = useState(false)
  const [cameraForVideo, setCameraForVideo] = useState(null)

  const [openAddByCoordsDialog, setOpenAddByCoordsDialog] = useState(false)
  const [fileError, setFileError] = useState('')

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [cameraToDelete, setCameraToDelete] = useState(null)

  const [newCameras, setNewCameras] = useState([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const [hovered, setHovered] = useState(false)

  const [blinkingCamera, setBlinkingCamera] = useState(null)

  // Примеры функций работы с Redux:
  const handleAddCamera = () => {
    if (cameraUrl.trim() && point) {
      const newCamera = {
        start: point,
        rtspUrl: cameraUrl.trim(),
      }

      // Если камера с такими данными уже есть, можно вывести ошибку
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

      dispatch(addCamera(newCamera))
      setCameraUrl('')
      setPoint(null)
      setOpenDialog(false)
    }
  }

  const handleAddCamerasByFile = (cameras) => {
    dispatch(addCameras(cameras))
    setNewCameras(cameras)
    setSnackbarOpen(true)
  }

  const handleConfirmDeleteCamera = () => {
    dispatch(removeCamera(cameraToDelete))
    setCameraToDelete(null)
    setOpenDeleteDialog(false)
  }

  const handleOpenVideoDialog = (camera) => {
    setCameraForVideo(camera)
    setOpenVideoDialog(true)
  }

  const handleCloseVideoDialog = () => {
    setCameraForVideo(null)
    setOpenVideoDialog(false)
  }

  // Пример логики для обработки нажатия клавиши Escape
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (openDialog) {
          setOpenDialog(false)
        } else if (point) {
          setPoint(null)
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [openDialog, point])

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return
    if (!hovered) setSnackbarOpen(false)
  }

  const handleMouseEnter = () => setHovered(true)
  const handleMouseLeave = () => setHovered(false)

  // Пример логики для моргания маркера (изменение цвета iconColor)
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
        onAddByCoordsClick={() => setOpenAddByCoordsDialog(true)}
        cameraCount={cameraViews.length}
      />

      <AddCameraByCoordsDialog
        openDialog={openAddByCoordsDialog}
        handleDialogClose={() => setOpenAddByCoordsDialog(false)}
        handleAddCamerasByFile={handleAddCamerasByFile}
        handleAddCameraByCoords={(camera) => dispatch(addCamera(camera))}
        cameraViews={cameraViews}
        fileError={fileError}
        setFileError={setFileError}
      />

      <div style={{ marginTop: 64, height: 'calc(100% - 64px)' }}>
        <CameraMap
          point={point}
          setPoint={setPoint}
          cameraViews={cameraViews}
          iconColor={iconColor}
          mapRef={mapRef}
          handleDialogOpen={() => setOpenDialog(true)}
          handleOpenVideoDialog={handleOpenVideoDialog}
          blinkingCamera={blinkingCamera}
        />
      </div>

      <CameraDrawer
        drawerOpen={drawerOpen}
        onCloseDrawer={() => setDrawerOpen(false)}
        cameraViews={cameraViews}
        iconColor={iconColor}
        search={search}
        setSearch={setSearch}
        handleDeleteCamera={(camera) => {
          setCameraToDelete(camera)
          setOpenDeleteDialog(true)
        }}
        startBlinkingMarker={startBlinkingMarker}
        blinkingCamera={blinkingCamera}
      />

      <AddCameraDialog
        openDialog={openDialog}
        handleDialogClose={() => {
          setOpenDialog(false)
          setPoint(null)
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
        onClose={() => setOpenDeleteDialog(false)}
        onConfirm={handleConfirmDeleteCamera}
      />

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        ContentProps={{
          sx: {
            width: '40vw',
            maxWidth: '40vw',
          },
        }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity="success"
          sx={{ width: '100%', maxHeight: '50vh', overflowY: 'auto' }}
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
