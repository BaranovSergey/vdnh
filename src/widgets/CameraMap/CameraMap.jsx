import React, { useState, useEffect } from 'react'
import {
  MapContainer,
  TileLayer,
  useMapEvents,
  Polygon,
  Marker,
  Tooltip,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { renderToString } from 'react-dom/server'
import VideocamIcon from '@mui/icons-material/Videocam'
import Hls from 'hls.js' // Импортируем HLS.js

// ====== Создание кастомной иконки ======
const createCameraIcon = (color) =>
  new L.DivIcon({
    className: 'custom-div-icon',
    html: renderToString(
      <VideocamIcon
        style={{
          color,
          fontSize: '24px',
        }}
      />
    ),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

// ====== Расчёт области видимости (треугольник) ======
const calculateCameraView = (
  start,
  end,
  radius = 0.0002,
  fov = Math.PI / 5
) => {
  const angle = Math.atan2(end.lat - start.lat, end.lng - start.lng) // Угол направления камеры
  const points = [] // Точки полукруга
  const step = fov / 30 // Количество шагов для плавности полукруга

  // Генерация точек для полукруга
  for (let a = -fov / 2; a <= fov / 2; a += step) {
    const currentAngle = angle + a

    const point = {
      lat: start.lat + radius * Math.sin(currentAngle),
      lng:
        start.lng +
        (radius * Math.cos(currentAngle)) /
          Math.cos((start.lat * Math.PI) / 180),
    }

    points.push([point.lat, point.lng])
  }

  // Добавляем начальную точку камеры в полукруг
  points.unshift([start.lat, start.lng])

  return points
}

// ====== Компонент для обработки кликов/движения мыши ======
function MapClickHandler({
  point,
  direction,
  setPoint,
  setDirection,
  openDialog,
  handleDialogOpen,
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      if (point && direction) {
        // Открываем диалог для добавления камеры
        handleDialogOpen()
      } else {
        // Сохраняем точку
        setPoint({ lat, lng })
      }
    },
    mousemove(e) {
      if (!point) return
      const { lat, lng } = e.latlng
      setDirection({ lat, lng })
    },
  })
  return null
}

// ====== Основной компонент карты ======
function CameraMap({
  point,
  direction,
  setPoint,
  setDirection,
  cameraViews,
  highlightedCamera,
  iconColor,
  mapRef,
  openDialog,
  handleDialogOpen,
  handleOpenDeleteDialog, // Получаем функцию открытия диалога удаления
}) {
  const [hoveredCamera, setHoveredCamera] = useState(null) // Состояние для хранения активной камеры

  useEffect(() => {
    if (hoveredCamera?.ip) {
      const videoElement = document.getElementById(`video-${hoveredCamera.ip}`)
      const hlsUrl = `http://localhost:8000/stream.m3u8` // Ваш локальный HLS URL

      if (Hls.isSupported() && videoElement) {
        const hls = new Hls()
        hls.loadSource(hlsUrl)
        hls.attachMedia(videoElement)

        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoElement.play()
        })

        return () => {
          hls.destroy()
        }
      } else if (videoElement?.canPlayType('application/vnd.apple.mpegurl')) {
        videoElement.src = hlsUrl
      }
    }
  }, [hoveredCamera])

  return (
    <MapContainer
      center={[55.83, 37.629]}
      zoom={16}
      className="leaflet-container"
      style={{ height: '100%', zIndex: 2 }}
      maxBounds={[
        [55.81, 37.58],
        [55.85, 37.67],
      ]}
      maxBoundsViscosity={1.0}
      whenCreated={(mapInstance) => {
        mapRef.current = mapInstance
      }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <MapClickHandler
        point={point}
        direction={direction}
        setPoint={setPoint}
        setDirection={setDirection}
        openDialog={openDialog}
        handleDialogOpen={handleDialogOpen}
      />

      {/* Все добавленные области видимости + маркеры */}
      {cameraViews.map((view, index) => (
        <React.Fragment key={index}>
          {/* Полукруговая область видимости */}
          <Polygon
            positions={calculateCameraView(
              view.start,
              view.end,
              0.0002,
              Math.PI / 5
            )} // Радиус и угол обзора
            color="transparent"
            fillColor="rgba(0, 0, 255, 0.9)"
            weight={1.5}
          />
          {/* Камера (маркер) */}
          <Marker
            position={[view.start.lat, view.start.lng]}
            icon={createCameraIcon(
              highlightedCamera?.ip === view.ip ? iconColor : 'black'
            )}
            eventHandlers={{
              click: () => handleOpenDeleteDialog(view), // Открыть диалог удаления
              mouseover: () => setHoveredCamera(view), // Наведение мыши
              mouseout: () => setHoveredCamera(null), // Убрать мышь
            }}
          >
            {/* Всплывающее окно с видео при наведении */}
            {hoveredCamera?.ip === view.ip && (
              <Tooltip direction="top" offset={[0, -20]} permanent>
                <div style={{ width: '200px', height: '150px' }}>
                  <video
                    id={`video-${view.ip}`}
                    style={{ width: '100%', height: '100%' }}
                    controls
                    autoPlay
                    muted
                    onError={(e) => console.error('Video error:', e)}
                    onLoadedData={() => console.log('Video loaded')}
                    onPlay={() => console.log('Video is playing')}
                    onPause={() => console.log('Video paused')}
                  />
                </div>
              </Tooltip>
            )}
          </Marker>
        </React.Fragment>
      ))}

      {/* Текущая (ещё не подтверждённая) область видимости */}
      {point && direction && (
        <Polygon
          positions={calculateCameraView(point, direction)}
          color="green"
          fillColor="rgba(0, 255, 0, 0.4)"
          weight={1.5}
        />
      )}
    </MapContainer>
  )
}

export default CameraMap
