import React, { useState, useRef, useEffect } from 'react'
import './App.css'
import Navbar from './widgets/Navbar/Navbar'
import CameraMap from './widgets/CameraMap/CameraMap'
import CameraDrawer from './widgets/CameraDrawer/CameraDrawer'
import AddCameraDialog from './widgets/AddCameraDialog/AddCameraDialog'
import DeleteCameraDialog from './widgets/AddCameraDialog/DeleteCameraDialog'

function App() {
  const [point, setPoint] = useState(null)
  const [direction, setDirection] = useState(null)
  const [cameraViews, setCameraViews] = useState([])
  const [openDialog, setOpenDialog] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [cameraIP, setCameraIP] = useState('')
  const [search, setSearch] = useState('')
  const [highlightedCamera, setHighlightedCamera] = useState(null)
  const [iconColor, setIconColor] = useState('black')
  const mapRef = useRef(null)

  // Состояния для диалога удаления камеры
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

  // Удаление камеры
  const handleDeleteCamera = () => {
    if (cameraToDelete) {
      setCameraViews((prev) => prev.filter((c) => c.ip !== cameraToDelete.ip))
      handleCloseDeleteDialog()
    }
  }

  // ===== Обработчик клавиши Escape =====
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        if (openDialog) {
          // Закрываем диалог добавления камеры
          setOpenDialog(false)
        } else if (point || direction) {
          // Отменяем создание камеры
          setPoint(null)
          setDirection(null)
        }
      }
    }

    // Добавляем слушатель события
    window.addEventListener('keydown', handleKeyDown)

    // Убираем слушатель при размонтировании
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [openDialog, point, direction])

  return (
    <div style={{ height: '100vh' }}>
      <Navbar onMenuClick={() => setDrawerOpen(true)} />
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
          handleOpenDeleteDialog={handleOpenDeleteDialog}
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
        // Передаём функцию для мигания камеры
        startBlinkingMarker={(camera) => {
          setHighlightedCamera(camera)
          // Логика мигания
          const timer = setInterval(() => {
            setIconColor((prevColor) =>
              prevColor === 'black' ? 'red' : 'black'
            )
          }, 500)

          // Сбрасываем подсветку через 3 секунды
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
          // Закрываем диалог и сбрасываем точку и направление
          setOpenDialog(false)
          setPoint(null)
          setDirection(null)
        }}
        cameraIP={cameraIP}
        setCameraIP={setCameraIP}
        handleAddCamera={() => {
          if (cameraIP.trim() && point && direction) {
            setCameraViews((prev) => [
              ...prev,
              { start: point, end: direction, ip: cameraIP.trim() },
            ])
            setCameraIP('')
            setPoint(null)
            setDirection(null)
            setOpenDialog(false)
          }
        }}
      />

      <DeleteCameraDialog
        open={openDeleteDialog}
        camera={cameraToDelete}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleDeleteCamera}
      />
    </div>
  )
}

export default App
