'use client'

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import { usePreloaderReady } from '@/Preloader/Component'
import { PageTransition } from './Component'

export function RouteTransition() {
  const pathname = usePathname()
  const previousPathname = useRef(pathname)
  const [transitionPathname, setTransitionPathname] = useState<string | null>(null)
  const preloaderReady = usePreloaderReady()

  useEffect(() => {
    if (pathname === previousPathname.current) return
    previousPathname.current = pathname
    setTransitionPathname(pathname)
  }, [pathname])

  return (
    <PageTransition
      phase={preloaderReady && transitionPathname !== null ? 'reveal' : 'idle'}
      transitionKey={transitionPathname ?? undefined}
    />
  )
}
