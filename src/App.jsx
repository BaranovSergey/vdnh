// App.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import Navbar from './features/layout/Navbar'
import CameraMap from './features/cameras/components/CameraMap'
import CameraDrawer from './features/cameras/components/CameraDrawer'
import AddCameraByCoordsDialog from './features/cameras/dialogs/AddCameraByCoordsDialog'
import {
  fetchCameras,
  addCameraToAPI,
  deleteCameraFromAPI,
  addCamerasToAPI,
  updateCameraDirection,
  updateCameraCoordinates,
} from './store/camerasSlice'
import CameraDialogs from './features/cameras/dialogs/CameraDialogs'
import NewCamerasSnackbar from './features/cameras/snackbar/NewCamerasSnackbar'
import useEscapeKey from './hooks/useEscapeKey'
import useBlinkingMarker from './hooks/useBlinkingMarker'
import './App.css'

// Функция для вычисления азимута (в градусах)
const computeBearing = (lat1, lng1, lat2, lng2) => {
  const toRad = (deg) => (deg * Math.PI) / 180
  const toDeg = (rad) => (rad * 180) / Math.PI

  const φ1 = toRad(lat1)
  const φ2 = toRad(lat2)
  const Δλ = toRad(lng2 - lng1)

  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x =
    Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  let bearing = toDeg(Math.atan2(y, x))
  return (bearing + 360) % 360
}

function App() {
  const cameraViews = useSelector((state) => state.cameras.cameraViews)
  const dispatch = useDispatch()

  const [point, setPoint] = useState(null)
  const [openDialog, setOpenDialog] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [cameraUrl, setCameraUrl] = useState('')
  const [search, setSearch] = useState('')
  const mapRef = useRef(null)
  const [openVideoDialog, setOpenVideoDialog] = useState(false)
  const [cameraForVideo, setCameraForVideo] = useState(null)
  const [openAddByCoordsDialog, setOpenAddByCoordsDialog] = useState(false)
  const [fileError, setFileError] = useState('')
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [cameraToDelete, setCameraToDelete] = useState(null)
  const [newCameras, setNewCameras] = useState([])
  const [snackbarOpen, setSnackbarOpen] = useState(false)
  const markerRefs = useRef({})
  const { startBlinkingMarker } = useBlinkingMarker()

  // Состояния для режимов задания угла и перемещения
  const [angleSettingCamera, setAngleSettingCamera] = useState(null)
  const [moveSettingCamera, setMoveSettingCamera] = useState(null)

  useEffect(() => {
    dispatch(fetchCameras())
  }, [dispatch])

  // Функция добавления камеры
  const handleAddCamera = useCallback(() => {
    if (cameraUrl.trim() && point) {
      const newCamera = {
        rtspUrl: cameraUrl.trim(),
        start: { lat: point.lat, lng: point.lng },
      }

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
  }, [cameraUrl, point, cameraViews, dispatch])

  const handleConfirmDeleteCamera = useCallback(() => {
    if (cameraToDelete) {
      dispatch(deleteCameraFromAPI(cameraToDelete.id))
      setCameraToDelete(null)
      setOpenDeleteDialog(false)
    }
  }, [cameraToDelete, dispatch])

  const handleOpenVideoDialog = useCallback((camera) => {
    setCameraForVideo(camera)
    setOpenVideoDialog(true)
  }, [])

  const handleCloseVideoDialog = useCallback(() => {
    setCameraForVideo(null)
    setOpenVideoDialog(false)
  }, [])

  const handleSnackbarClose = useCallback((event, reason) => {
    if (reason === 'clickaway') return
    setSnackbarOpen(false)
  }, [])

  // Режим задания угла
  const handleSetAngle = useCallback((camera) => {
    setAngleSettingCamera(camera)
    setOpenVideoDialog(false)
  }, [])

  // Режим перемещения
  const handleSetMove = useCallback((camera) => {
    setMoveSettingCamera(camera)
    setOpenVideoDialog(false)
  }, [])

  // Клик по карте для сохранения нового угла
  const handleMapClickForAngle = useCallback(
    (latlng) => {
      if (!angleSettingCamera) return
      const { lat, lng } = angleSettingCamera.start
      const bearing = computeBearing(lat, lng, latlng.lat, latlng.lng)
      dispatch(
        updateCameraDirection({ id: angleSettingCamera.id, direction: bearing })
      )
      setAngleSettingCamera(null)
    },
    [angleSettingCamera, dispatch]
  )

  // Клик по карте для сохранения новых координат при перемещении
  const handleMapClickForMove = useCallback(
    (latlng) => {
      if (!moveSettingCamera) return
      dispatch(
        updateCameraCoordinates({
          id: moveSettingCamera.id,
          lat: latlng.lat,
          lng: latlng.lng,
        })
      )
      setMoveSettingCamera(null)
    },
    [moveSettingCamera, dispatch]
  )

  // Выход из режимов по нажатию Escape
  useEscapeKey(() => {
    if (openDialog) {
      setOpenDialog(false)
    } else if (point) {
      setPoint(null)
    } else if (angleSettingCamera) {
      setAngleSettingCamera(null)
    } else if (moveSettingCamera) {
      setMoveSettingCamera(null)
    }
  }, [openDialog, point, angleSettingCamera, moveSettingCamera])

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
          mapRef={mapRef}
          handleDialogOpen={() => setOpenDialog(true)}
          handleOpenVideoDialog={handleOpenVideoDialog}
          search={search}
          markerRefs={markerRefs}
          onMapClick={
            angleSettingCamera
              ? handleMapClickForAngle
              : moveSettingCamera
              ? handleMapClickForMove
              : null
          }
          angleSettingCamera={angleSettingCamera}
          moveSettingCamera={moveSettingCamera}
        />
      </div>
      <CameraDrawer
        drawerOpen={drawerOpen}
        onCloseDrawer={() => setDrawerOpen(false)}
        cameraViews={cameraViews}
        search={search}
        setSearch={setSearch}
        handleDeleteCamera={(camera) => {
          setCameraToDelete(camera)
          setOpenDeleteDialog(true)
        }}
        startBlinkingMarker={(camera) =>
          startBlinkingMarker(camera, markerRefs)
        }
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
        onSetAngle={handleSetAngle}
        onSetMove={handleSetMove}
      />
      <NewCamerasSnackbar
        snackbarOpen={snackbarOpen}
        handleSnackbarClose={handleSnackbarClose}
        newCameras={newCameras}
      />
    </div>
  )
}

export default App
