'use client'

import { useRef, type RefObject } from 'react'
import useAnimations from '@/animations/useAnimations'

export type PageTransitionPhase = 'idle' | 'cover' | 'reveal'

type PageTransitionAnimationOptions = {
  overlayRef: RefObject<HTMLDivElement | null>
  phase: PageTransitionPhase
  transitionKey?: string
  onCovered?: () => void
  onRevealed?: () => void
}

export function usePageTransitionAnimation({
  overlayRef,
  phase,
  transitionKey,
  onCovered,
  onRevealed,
}: PageTransitionAnimationOptions) {
  const callbacks = useRef({ onCovered, onRevealed })
  callbacks.current = { onCovered, onRevealed }

  return useAnimations({
    refs: [overlayRef],
    scope: overlayRef,
    deps: [phase, transitionKey],
    clearProps: false,
    onReady: (timeline) => {
      const overlay = overlayRef.current
      if (!overlay) return
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      if (phase === 'idle') {
        timeline.set(overlay, { scaleY: 0, visibility: 'hidden' }).play()
        return
      }

      timeline.set(overlay, {
        visibility: 'visible',
        transformOrigin: phase === 'cover' ? 'center bottom' : 'center top',
      })
      // Reveal starts covered, including when mounted after a route has changed.
      if (phase === 'reveal') timeline.set(overlay, { scaleY: 1 })
      timeline.to(overlay, {
        scaleY: phase === 'cover' ? 1 : 0,
        duration: reducedMotion ? 0 : 0.45,
        ease: 'power2.inOut',
      })
      if (phase === 'reveal') timeline.set(overlay, { visibility: 'hidden' })
      timeline.eventCallback('onComplete', () => {
        if (phase === 'cover') callbacks.current.onCovered?.()
        else callbacks.current.onRevealed?.()
      })
      timeline.play()
    },
  })
}
