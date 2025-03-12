import { useRef, useCallback } from 'react'
import { createCameraIcon } from '../features/cameras/components/CameraMap'

const useBlinkingMarker = () => {
  // Используем ref для хранения таймера
  const timerRef = useRef(null)

  const startBlinkingMarker = useCallback((camera, markerRefs) => {
    const markerRef = markerRefs.current[camera.rtspUrl]
    if (!markerRef?.current) return

    let isRed = false

    if (timerRef.current) {
      clearInterval(timerRef.current)
    }
    timerRef.current = setInterval(() => {
      if (markerRef.current) {
        markerRef.current.setIcon(createCameraIcon(isRed ? 'red' : 'black'))
      }
      isRed = !isRed
    }, 100)

    setTimeout(() => {
      clearInterval(timerRef.current)
      timerRef.current = null
      if (markerRef.current) {
        markerRef.current.setIcon(createCameraIcon('black'))
      }
    }, 3000)
  }, [])

  return { startBlinkingMarker }
}

export default useBlinkingMarker
