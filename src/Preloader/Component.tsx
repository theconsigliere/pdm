'use client'

import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { usePreloaderAnimation } from './animations/animatePreloader'
import './preloader.css'

// Components outside a preloader can still run their entrance animations independently.
const PreloaderReadyContext = createContext(true)

export function usePreloaderReady() {
  return useContext(PreloaderReadyContext)
}

export function Preloader({ children }: { children: ReactNode }) {
  const overlayRef = useRef<HTMLDivElement>(null)
  const [loaded, setLoaded] = useState(false)
  const [complete, setComplete] = useState(false)

  useEffect(() => {
    const handleLoad = () => setLoaded(true)
    if (document.readyState === 'complete') {
      handleLoad()
      return
    }
    window.addEventListener('load', handleLoad, { once: true })
    return () => window.removeEventListener('load', handleLoad)
  }, [])

  usePreloaderAnimation({ overlayRef, loaded, onComplete: () => setComplete(true) })

  return (
    <PreloaderReadyContext.Provider value={complete}>
      {children}
      {!complete && (
        <div ref={overlayRef} className="preloader" role="status" aria-label="Loading page">
          <span className="preloader__label">Loading</span>
        </div>
      )}
    </PreloaderReadyContext.Provider>
  )
}
