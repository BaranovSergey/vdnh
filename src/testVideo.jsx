import React, { useEffect, useRef } from 'react'
import Hls from 'hls.js'

function TestVideo({ hlsUrl }) {
  const videoRef = useRef(null)

  useEffect(() => {
    if (hlsUrl && videoRef.current) {
      // Если браузер поддерживает Hls.js
      if (Hls.isSupported()) {
        const hls = new Hls()
        hls.loadSource(hlsUrl) // "http://localhost:8000/stream.m3u8"
        hls.attachMedia(videoRef.current)

        // Когда манифест загрузится, попытаемся запустить воспроизведение
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current.play().catch((err) => {
            console.warn('Автовоспроизведение заблокировано браузером', err)
          })
        })

        // Очищаем ресурсы при размонтировании
        return () => {
          hls.destroy()
        }
      } else if (
        videoRef.current.canPlayType('application/vnd.apple.mpegurl')
      ) {
        // iOS Safari может воспроизводить HLS без Hls.js
        videoRef.current.src = hlsUrl
      }
    }
  }, [hlsUrl])

  return (
    <div
      style={{
        width: '400px',
        height: '300px',
        background: '#000',
      }}
    >
      <video
        ref={videoRef}
        style={{ width: '100%', height: '100%' }}
        controls
        autoPlay
        muted
      />
    </div>
  )
}

export default TestVideo
