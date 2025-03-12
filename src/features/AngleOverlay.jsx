// AngleOverlay.jsx
import React from 'react'
import { Polygon } from 'react-leaflet'

const toRad = (deg) => (deg * Math.PI) / 180
const toDeg = (rad) => (rad * 180) / Math.PI

const computeDestinationPoint = (lat, lng, bearing, distance) => {
  const R = 6378137 // радиус Земли в метрах
  const bearingRad = toRad(bearing)
  const latRad = toRad(lat)
  const lngRad = toRad(lng)

  const lat2 = Math.asin(
    Math.sin(latRad) * Math.cos(distance / R) +
      Math.cos(latRad) * Math.sin(distance / R) * Math.cos(bearingRad)
  )
  const lng2 =
    lngRad +
    Math.atan2(
      Math.sin(bearingRad) * Math.sin(distance / R) * Math.cos(latRad),
      Math.cos(distance / R) - Math.sin(latRad) * Math.sin(lat2)
    )

  return [toDeg(lat2), toDeg(lng2)]
}

const AngleOverlay = ({
  center,
  direction,
  fov = 25,
  radius = 30,
  segments = 20,
}) => {
  const points = []
  const halfFov = fov / 2
  const startAngle = direction - halfFov

  // Генерируем точки дуги сектора
  for (let i = 0; i <= segments; i++) {
    const angle = startAngle + (fov * i) / segments
    points.push(computeDestinationPoint(center[0], center[1], angle, radius))
  }
  // Формируем массив точек полигона: от центра к дуге и обратно в центр
  const polygonPoints = [center, ...points, center]

  return (
    <Polygon
      positions={polygonPoints}
      pathOptions={{
        color: 'blue',
        fillColor: 'blue',
        fillOpacity: 0.2,
        weight: 1,
      }}
    />
  )
}

export default AngleOverlay
