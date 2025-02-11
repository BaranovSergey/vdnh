import React, { useEffect, useRef, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Navbar from './features/layout/Navbar'
import CameraMap from './features/cameras/components/CameraMap'
import CameraDrawer from './features/cameras/components/CameraDrawer'
import AddCameraByCoordsDialog from './features/cameras/dialogs/AddCameraByCoordsDialog'
import {
  fetchCameras,
  addCameraToAPI,
  deleteCameraFromAPI,
} from './store/camerasSlice'
import CameraDialogs from './features/cameras/dialogs/CameraDialogs'
import NewCamerasSnackbar from './features/cameras/snackbar/NewCamerasSnackbar'
import useEscapeKey from './hooks/useEscapeKey'
import useBlinkingMarker from './hooks/useBlinkingMarker'
import './App.css'
import { addCamerasToAPI } from './store/camerasSlice'

function App() {
  const cameraViews = useSelector((state) => state.cameras.cameraViews)
  const dispatch = useDispatch()

  const [point, setPoint] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [cameraUrl, setCameraUrl] = useState('')
  const [search, setSearch] = useState('')
  const [iconColor] = useState('black')
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

  const markerRefs = useRef({})
  const { blinkingCamera, startBlinkingMarker } = useBlinkingMarker()

  // ✅ Загружаем камеры из API при старте
  useEffect(() => {
    dispatch(fetchCameras())
  }, [dispatch])

  // ✅ Добавление камеры (отправка в API)
  const handleAddCamera = () => {
    if (cameraUrl.trim() && point) {
      const newCamera = {
        rtspUrl: cameraUrl.trim(),
        start: { lat: point.lat, lng: point.lng },
      }

      // Проверка на дублирование (на клиенте)
      const exists = cameraViews.find(
        (camera) =>
          camera.rtspUrl.trim().toLowerCase() ===
          newCamera.rtspUrl.trim().toLowerCase()
      )
      if (exists) {
        setFileError('Камера с такой RTSP-ссылкой уже существует.')
        return
      }

      dispatch(addCameraToAPI(newCamera)).then((action) => {
        if (action.payload) {
          const camerasArray = Array.isArray(action.payload)
            ? action.payload
            : [action.payload]
          setNewCameras(camerasArray)
        }
        setCameraUrl('')
        setPoint(null)
        setOpenDialog(false)
        setSnackbarOpen(true)
      })
    }
  }

  // ✅ Удаление камеры (API-запрос)
  const handleConfirmDeleteCamera = () => {
    if (cameraToDelete) {
      dispatch(deleteCameraFromAPI(cameraToDelete.id))
      setCameraToDelete(null)
      setOpenDeleteDialog(false)
    }
  }

  const handleOpenVideoDialog = (camera) => {
    setCameraForVideo(camera)
    setOpenVideoDialog(true)
  }

  const handleCloseVideoDialog = () => {
    setCameraForVideo(null)
    setOpenVideoDialog(false)
  }

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') return
    setSnackbarOpen(false)
  }

  const handleMouseEnter = () => setHovered(true)
  const handleMouseLeave = () => setHovered(false)

  useEscapeKey(() => {
    if (openDialog) {
      setOpenDialog(false)
    } else if (point) {
      setPoint(null)
    }
  }, [openDialog, point])

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
        handleAddCamerasByFile={(cameras) => {
          dispatch(addCamerasToAPI(cameras)).then((action) => {
            if (action.payload) {
              // Обновляем newCameras для Snackbar (но главное — Redux-состояние обновляется в extraReducers)
              const camerasArray = Array.isArray(action.payload)
                ? action.payload
                : [action.payload]
              setNewCameras(camerasArray)
            }
            setSnackbarOpen(true)
          })
        }}
        handleAddCameraByCoords={(camera) => dispatch(addCameraToAPI(camera))}
        cameraViews={cameraViews}
        fileError={fileError}
        setFileError={setFileError}
        setNewCameras={setNewCameras}
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
          markerRefs={markerRefs}
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
        startBlinkingMarker={(camera) =>
          startBlinkingMarker(camera, markerRefs)
        }
        blinkingCamera={blinkingCamera}
      />

      <CameraDialogs
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        cameraUrl={cameraUrl}
        setCameraUrl={setCameraUrl}
        handleAddCamera={handleAddCamera}
        openVideoDialog={openVideoDialog}
        cameraForVideo={cameraForVideo}
        handleCloseVideoDialog={handleCloseVideoDialog}
        openDeleteDialog={openDeleteDialog}
        cameraToDelete={cameraToDelete}
        setOpenDeleteDialog={setOpenDeleteDialog}
        handleConfirmDeleteCamera={handleConfirmDeleteCamera}
        setPoint={setPoint}
        fileError={fileError}
      />

      <NewCamerasSnackbar
        snackbarOpen={snackbarOpen}
        handleSnackbarClose={handleSnackbarClose}
        newCameras={newCameras}
        handleMouseEnter={handleMouseEnter}
        handleMouseLeave={handleMouseLeave}
      />
    </div>
  )
}

export default App
