'use client'

import type { RefObject } from 'react'
import useAnimations from '@/animations/useAnimations'

type PreloaderAnimationOptions = {
  overlayRef: RefObject<HTMLDivElement | null>
  loaded: boolean
  onComplete: () => void
}

export function usePreloaderAnimation({
  overlayRef,
  loaded,
  onComplete,
}: PreloaderAnimationOptions) {
  return useAnimations({
    refs: [overlayRef],
    scope: overlayRef,
    deps: [loaded],
    clearProps: false,
    onReady: (timeline) => {
      if (!loaded || !overlayRef.current) return
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      timeline.to(overlayRef.current, {
        autoAlpha: 0,
        duration: reducedMotion ? 0 : 0.45,
        ease: 'power2.out',
      })
      timeline.eventCallback('onComplete', onComplete)
      timeline.play()
    },
  })
}
