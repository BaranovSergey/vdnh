import React from 'react'
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
  const angle = Math.atan2(end.lat - start.lat, end.lng - start.lng)
  const points = []
  const step = fov / 30

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

  points.unshift([start.lat, start.lng]) // начальная точка камеры
  return points
}

function MapClickHandler({
  point,
  direction,
  setPoint,
  setDirection,
  handleDialogOpen,
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      if (point && direction) {
        // Открываем диалог "Добавить камеру"
        handleDialogOpen()
      } else {
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
  handleOpenDeleteDialog,
  handleOpenVideoDialog,
}) {
  return (
    <MapContainer
      center={[55.83, 37.629]}
      zoom={16}
      doubleClickZoom={false}
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
        handleDialogOpen={handleDialogOpen}
      />

      {cameraViews.map((view, index) => {
        // Извлечение части после символа @
        const rtspDetails = view.rtspUrl.includes('@')
          ? view.rtspUrl.split('@')[1]
          : 'Данные отсутствуют'

        return (
          <React.Fragment key={index}>
            {/* Конус обзора */}
            <Polygon
              positions={calculateCameraView(
                view.start,
                view.end,
                0.0002,
                Math.PI / 5
              )}
              color="transparent"
              fillColor="rgba(0, 0, 255, 0.9)"
              weight={1.5}
              interactive={false}
            />

            {/* Маркер */}
            <Marker
              position={[view.start.lat, view.start.lng]}
              icon={createCameraIcon(
                highlightedCamera?.rtspUrl === view.rtspUrl
                  ? iconColor
                  : 'black'
              )}
              eventHandlers={{
                click: () => handleOpenVideoDialog(view),
              }}
            >
              {/* Попап для отображения части RTSP ссылки */}
              <Tooltip>
                <div>{rtspDetails}</div>
              </Tooltip>
            </Marker>
          </React.Fragment>
        )
      })}

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
