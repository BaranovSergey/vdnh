import { useState } from 'react'
import { createCameraIcon } from '../features/cameras/components/CameraMap'

const useBlinkingMarker = () => {
  const [blinkingCamera, setBlinkingCamera] = useState(null)

  const startBlinkingMarker = (camera, markerRefs) => {
    const markerRef = markerRefs.current[camera.rtspUrl]
    if (!markerRef?.current) return

    let isRed = false
    const timer = setInterval(() => {
      if (markerRef.current) {
        markerRef.current.setIcon(createCameraIcon(isRed ? 'red' : 'black'))
      }
      isRed = !isRed
    }, 100)

    setTimeout(() => {
      clearInterval(timer)
      if (markerRef.current) {
        markerRef.current.setIcon(createCameraIcon('black'))
      }
    }, 3000)
  }

  return { blinkingCamera, setBlinkingCamera, startBlinkingMarker }
}

export default useBlinkingMarker
