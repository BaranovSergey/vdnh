// CameraMap.jsx
import React, { useMemo, useState, useEffect } from 'react'
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
import AngleOverlay from '../../AngleOverlay'

export const createCameraIcon = (color) =>
  new L.DivIcon({
    className: 'custom-div-icon',
    html: renderToString(<VideocamIcon style={{ color, fontSize: '24px' }} />),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

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

const createGhostIcon = () =>
  new L.DivIcon({
    className: 'ghost-div-icon',
    html: renderToString(
      <VideocamIcon
        style={{ color: 'green', fontSize: '24px', opacity: 0.6 }}
      />
    ),
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  })

const CameraMap = ({
  point,
  setPoint,
  cameraViews = [],
  mapRef,
  handleDialogOpen, // Функция открытия диалога "Добавить камеру"
  handleOpenVideoDialog, // Функция открытия видео-диалога при клике на маркер
  search,
  markerRefs,
  // Функция обработки клика по карте (для задания угла или перемещения)
  onMapClick,
  // Если передана camera – значит мы в режиме задания угла
  angleSettingCamera,
  // Если передана камера – значит мы в режиме перемещения
  moveSettingCamera,
}) => {
  const [currentMousePos, setCurrentMousePos] = useState(null)

  // Хук для отключения/включения перетаскивания карты в режиме перемещения
  useEffect(() => {
    if (mapRef.current) {
      if (moveSettingCamera) {
        mapRef.current.dragging.disable()
      } else {
        mapRef.current.dragging.enable()
      }
    }
  }, [moveSettingCamera, mapRef])

  // Обработчик событий карты
  const MapEventHandler = () => {
    useMapEvents({
      click(e) {
        if (onMapClick) {
          onMapClick(e.latlng)
        } else {
          const { lat, lng } = e.latlng
          setPoint({ lat, lng })
          handleDialogOpen()
        }
      },
      mousemove(e) {
        if (onMapClick && (angleSettingCamera || moveSettingCamera)) {
          setCurrentMousePos(e.latlng)
        }
      },
    })
    return null
  }

  // Фильтрация камер по строке поиска
  const filteredCameras = useMemo(() => {
    return cameraViews.filter(
      (camera) =>
        camera.rtspUrl &&
        camera.rtspUrl.toLowerCase().includes(search.toLowerCase())
    )
  }, [cameraViews, search])

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

      <MapEventHandler />

      <MarkerClusterGroup
        key="marker-cluster-group"
        distance={40}
        spiderfyOnMaxZoom
        showCoverageOnHover={false}
        zoomToBoundsOnClick
        disableClusteringAtZoom={18}
      >
        {filteredCameras.map((camera) => {
          if (
            !camera ||
            !camera.start ||
            typeof camera.start.lat !== 'number' ||
            typeof camera.start.lng !== 'number'
          ) {
            console.error('Некорректные данные камеры', camera)
            return null
          }

          if (!markerRefs.current[camera.rtspUrl]) {
            markerRefs.current[camera.rtspUrl] = React.createRef()
          }

          return (
            <Marker
              key={camera.id || camera.rtspUrl}
              position={[camera.start.lat, camera.start.lng]}
              icon={createCameraIcon(camera.online ? 'black' : 'red')}
              ref={markerRefs.current[camera.rtspUrl]}
              eventHandlers={{
                click: (e) => {
                  e.originalEvent.stopPropagation()
                  handleOpenVideoDialog(camera)
                },
              }}
            >
              <Tooltip>{camera.rtspUrl}</Tooltip>
            </Marker>
          )
        })}
      </MarkerClusterGroup>

      {/* Призрачный маркер для перемещения */}
      {moveSettingCamera && currentMousePos && (
        <Marker
          position={[currentMousePos.lat, currentMousePos.lng]}
          icon={createGhostIcon()}
        ></Marker>
      )}

      {/* Динамический сектор для задания угла обзора */}
      {angleSettingCamera && currentMousePos && (
        <AngleOverlay
          key={`angle-setting-${
            angleSettingCamera.id || angleSettingCamera.rtspUrl
          }`}
          center={[angleSettingCamera.start.lat, angleSettingCamera.start.lng]}
          direction={computeBearing(
            angleSettingCamera.start.lat,
            angleSettingCamera.start.lng,
            currentMousePos.lat,
            currentMousePos.lng
          )}
          fov={25}
          radius={15}
        />
      )}

      {/* Статические сектора для камер с заданным направлением */}
      {filteredCameras.map((camera) => {
        if (
          angleSettingCamera &&
          (camera.id === angleSettingCamera.id ||
            camera.rtspUrl === angleSettingCamera.rtspUrl)
        ) {
          return null
        }
        if (camera.direction != null) {
          return (
            <AngleOverlay
              key={`angle-${camera.id || camera.rtspUrl}`}
              center={[camera.start.lat, camera.start.lng]}
              direction={camera.direction}
              fov={25}
              radius={15}
            />
          )
        }
        return null
      })}
    </MapContainer>
  )
}

export default React.memo(CameraMap)
