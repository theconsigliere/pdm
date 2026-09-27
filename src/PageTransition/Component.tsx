'use client'

import { useRef } from 'react'
import {
  usePageTransitionAnimation,
  type PageTransitionPhase,
} from './animations/animatePageTransition'
import './page-transition.css'

type PageTransitionProps = {
  phase: PageTransitionPhase
  transitionKey?: string
  onCovered?: () => void
  onRevealed?: () => void
}

export function PageTransition({
  phase,
  transitionKey,
  onCovered,
  onRevealed,
}: PageTransitionProps) {
  const overlayRef = useRef<HTMLDivElement>(null)
  usePageTransitionAnimation({ overlayRef, phase, transitionKey, onCovered, onRevealed })

  return <div ref={overlayRef} className="page-transition" aria-hidden="true" />
}
