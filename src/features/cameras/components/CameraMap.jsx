import React, { useMemo, useState } from 'react'
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

// Для вычисления азимута
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
  bearing = (bearing + 360) % 360
  return bearing
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
  handleDialogOpen, // Функция, открывающая диалог «Добавить камеру» (или что-то ещё)
  handleOpenVideoDialog, // Функция, открывающая диалог видео при клике на маркер
  search,
  markerRefs,
  // Функция, обрабатывающая клик по карте (для «передвинуть» или «задать угол»)
  onMapClick,
  // Если передана camera – значит мы в режиме задания угла
  angleSettingCamera,
  // Если передана camera – значит мы в режиме передвижения
  moveSettingCamera,
}) => {
  const [currentMousePos, setCurrentMousePos] = useState(null)

  // Обработчик событий на карте
  const MapEventHandler = () => {
    useMapEvents({
      click(e) {
        // Логируем для отладки
        console.log('Map click. onMapClick =', onMapClick)

        // Если передана onMapClick (режим «угол» или «передвинуть»)
        if (onMapClick) {
          onMapClick(e.latlng)
        } else {
          // Иначе обычное поведение – используем setPoint + handleDialogOpen
          const { lat, lng } = e.latlng
          console.log('Map click => add camera at ', lat, lng)
          setPoint({ lat, lng })
          handleDialogOpen()
        }
      },
      mousemove(e) {
        // Если мы в режиме задания угла или передвижения, сохраняем координаты мыши
        if (onMapClick && (angleSettingCamera || moveSettingCamera)) {
          setCurrentMousePos(e.latlng)
        }
      },
    })
    return null
  }

  // Фильтруем камеры по подстроке поиска
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
              icon={createCameraIcon('black')}
              ref={markerRefs.current[camera.rtspUrl]}
              eventHandlers={{
                click: (e) => {
                  console.log('Marker click => stopPropagation + open dialog.')
                  // Останавливаем всплытие, чтобы не пошёл клик на карту
                  e.originalEvent.stopPropagation()
                  // Открываем диалог
                  handleOpenVideoDialog(camera)
                },
              }}
            >
              <Tooltip>{camera.rtspUrl}</Tooltip>
            </Marker>
          )
        })}
      </MarkerClusterGroup>

      {/* Призрачный маркер при передвижении камеры */}
      {moveSettingCamera && currentMousePos && (
        <Marker
          position={[currentMousePos.lat, currentMousePos.lng]}
          icon={createGhostIcon()}
        >
          <Tooltip>Новое место камеры</Tooltip>
        </Marker>
      )}

      {/* Динамический сектор при задании угла */}
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

      {/* Статические сектора для камер, у которых уже есть direction */}
      {filteredCameras.map((camera) => {
        // Если эта камера сейчас в режиме задания угла – пропускаем отрисовку статического сектора
        if (
          angleSettingCamera &&
          (camera.id === angleSettingCamera.id ||
            camera.rtspUrl === angleSettingCamera.rtspUrl)
        ) {
          return null
        }
        // Если direction != null
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
