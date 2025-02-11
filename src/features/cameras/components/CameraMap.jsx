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

// Функция создания иконки камеры
export const createCameraIcon = (color) =>
  new L.DivIcon({
    className: 'custom-div-icon',
    html: renderToString(<VideocamIcon style={{ color, fontSize: '24px' }} />),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

// Обработчик клика по карте (создание камеры)
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
  mapRef,
  handleDialogOpen,
  handleOpenVideoDialog,
  search,
  startBlinkingMarker,
  markerRefs, // ✅ Передаём markerRefs из App.jsx
}) {
  // ✅ Переместили `filteredCameras` внутрь функции
  const filteredCameras = cameraViews
    .filter((camera) => camera.rtspUrl) // ✅ Фильтруем только камеры с URL
    .filter((camera) =>
      camera.rtspUrl.toLowerCase().includes(search?.toLowerCase() || '')
    ) // ✅ Безопасная проверка search

  return (
    <MapContainer
      center={[55.83, 37.629]}
      zoom={16}
      attributionControl={false}
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
        key={cameraViews.map((camera) => camera.id).join('-')}
        distance={40}
        spiderfyOnMaxZoom={true}
        showCoverageOnHover={false}
        zoomToBoundsOnClick={true}
        disableClusteringAtZoom={18}
      >
        {filteredCameras.map((view) => {
          // проверка и создание маркера
          if (
            !view ||
            !view.start ||
            typeof view.start.lat !== 'number' ||
            typeof view.start.lng !== 'number'
          ) {
            console.error('Ошибка: некорректные данные камеры', view)
            return null
          }
          if (!markerRefs.current[view.rtspUrl]) {
            markerRefs.current[view.rtspUrl] = React.createRef()
          }
          return (
            <Marker
              key={view.id} // лучше использовать уникальное значение id
              position={[view.start.lat, view.start.lng]}
              icon={createCameraIcon('black')}
              ref={markerRefs.current[view.rtspUrl]}
              eventHandlers={{
                click: () => handleOpenVideoDialog(view),
              }}
            >
              <Tooltip>
                <div>{view.rtspUrl}</div>
              </Tooltip>
            </Marker>
          )
        })}
      </MarkerClusterGroup>
    </MapContainer>
  )
}

export default CameraMap
