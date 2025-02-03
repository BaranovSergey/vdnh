import React from 'react'
import {
  MapContainer,
  TileLayer,
  Marker,
  Tooltip,
  useMapEvents,
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { renderToString } from 'react-dom/server'
import VideocamIcon from '@mui/icons-material/Videocam'
import MarkerClusterGroup from 'react-leaflet-markercluster'

// Функция для создания иконки камеры с заданным цветом
const createCameraIcon = (color) =>
  new L.DivIcon({
    className: 'custom-div-icon',
    html: renderToString(<VideocamIcon style={{ color, fontSize: '24px' }} />),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

// Обработчик клика по карте, устанавливающий точку и открывающий диалог
function MapClickHandler({ setPoint, handleDialogOpen }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng
      setPoint({ lat, lng })
      handleDialogOpen()
    },
  })
  return null
}

function CameraMap({
  point,
  setPoint,
  cameraViews,
  iconColor,
  mapRef,
  handleDialogOpen,
  handleOpenVideoDialog,
  blinkingCamera,
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
        setPoint={setPoint}
        handleDialogOpen={handleDialogOpen}
      />

      <MarkerClusterGroup
        distance={40}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
        disableClusteringAtZoom={18}
      >
        {cameraViews.map((view, index) => {
          // Если данный маркер является мигающим, используем iconColor, иначе 'black'
          const markerColor =
            blinkingCamera?.rtspUrl === view.rtspUrl ? iconColor : 'black'

          // Извлекаем часть RTSP ссылки для отображения в Tooltip
          const rtspDetails = view.rtspUrl.includes('@')
            ? view.rtspUrl.split('@')[1]
            : 'Данные отсутствуют'

          return (
            <Marker
              key={index}
              position={[view.start.lat, view.start.lng]}
              icon={createCameraIcon(markerColor)}
              eventHandlers={{
                click: () => handleOpenVideoDialog(view),
              }}
            >
              <Tooltip>
                <div>{rtspDetails}</div>
              </Tooltip>
            </Marker>
          )
        })}
      </MarkerClusterGroup>
    </MapContainer>
  )
}

export default CameraMap
