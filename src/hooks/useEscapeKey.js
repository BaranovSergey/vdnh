import { useEffect } from 'react'

const useEscapeKey = (handler, dependencies = []) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        handler(event)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, dependencies)
}

export default useEscapeKey
