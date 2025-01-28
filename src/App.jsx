import React, { useState, useRef, useEffect } from 'react'
import './App.css'
import Navbar from './widgets/Navbar/Navbar'
import CameraMap from './widgets/CameraMap/CameraMap'
import CameraDrawer from './widgets/CameraDrawer/CameraDrawer'
import AddCameraDialog from './widgets/CameraDialog/AddCameraDialog'
import VideoDialog from './widgets/CameraDialog/VideoDialog'
import DeleteCameraDialog from './widgets/CameraDialog/DeleteCameraDialog'
import AddCameraByCoordinatesDialog from './widgets/CameraDialog/AddCameraByCoordinatesDialog' // Новый диалог

function App() {
  const [point, setPoint] = useState(null)
  const [direction, setDirection] = useState(null)
  const [cameraViews, setCameraViews] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [openCoordsDialog, setOpenCoordsDialog] = useState(false) // Диалог добавления по координатам
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [cameraUrl, setCameraUrl] = useState('')
  const [search, setSearch] = useState('')
  const [highlightedCamera, setHighlightedCamera] = useState(null)
  const [iconColor, setIconColor] = useState('black')
  const mapRef = useRef(null)

  // Для видео диалога
  const [openVideoDialog, setOpenVideoDialog] = useState(false)
  const [cameraForVideo, setCameraForVideo] = useState(null)

  // Для диалога удаления
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false)
  const [cameraToDelete, setCameraToDelete] = useState(null)

  // Открытие диалога удаления
  const handleOpenDeleteDialog = (camera) => {
    setCameraToDelete(camera)
    setOpenDeleteDialog(true)
  }

  // Закрытие диалога удаления
  const handleCloseDeleteDialog = () => {
    setCameraToDelete(null)
    setOpenDeleteDialog(false)
  }

  // Подтверждение удаления камеры
  const handleConfirmDeleteCamera = () => {
    setCameraViews((prev) =>
      prev.filter(
        (existingCamera) => existingCamera.rtspUrl !== cameraToDelete.rtspUrl
      )
    )
    setCameraToDelete(null)
    setOpenDeleteDialog(false)
  }

  // Обработчик клавиши "Escape"
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (openDialog) {
          setOpenDialog(false)
        } else if (point || direction) {
          setPoint(null)
          setDirection(null)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
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

  // Добавление камеры через диалог выбора направления
  const handleAddCamera = () => {
    if (cameraUrl.trim() && point && direction) {
      const newCamera = {
        start: point,
        end: direction,
        rtspUrl: cameraUrl.trim(),
      }
      setCameraViews((prev) => [...prev, newCamera])
      setCameraUrl('')
      setPoint(null)
      setDirection(null)
      setOpenDialog(false)
    }
  }

  // Добавление камеры по координатам
  const handleAddCameraByCoordinates = (latitude, longitude, url) => {
    if (!latitude || !longitude || !url) {
      alert('Все поля должны быть заполнены!')
      return
    }

    const newCamera = {
      start: { lat: parseFloat(latitude), lng: parseFloat(longitude) },
      end: null, // Можно оставить null, если направление не требуется
      rtspUrl: url.trim(),
    }

    setCameraViews((prev) => [...prev, newCamera])
    setOpenCoordsDialog(false) // Закрыть диалог
  }

  return (
    <div style={{ height: '100vh' }}>
      <Navbar
        onMenuClick={() => setDrawerOpen(true)}
        onAddByCoordsClick={() => setOpenCoordsDialog(true)} // Кнопка для открытия диалога по координатам
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
        handleDeleteCamera={handleOpenDeleteDialog}
        startBlinkingMarker={(camera) => {
          setHighlightedCamera(camera)
          const timer = setInterval(() => {
            setIconColor((prevColor) =>
              prevColor === 'black' ? 'red' : 'black'
            )
          }, 500)
          setTimeout(() => {
            clearInterval(timer)
            setHighlightedCamera(null)
            setIconColor('black')
          }, 3000)
        }}
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

      <AddCameraByCoordinatesDialog
        open={openCoordsDialog}
        onClose={() => setOpenCoordsDialog(false)}
        onAddCamera={handleAddCameraByCoordinates}
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
    </div>
  )
}

export default App
