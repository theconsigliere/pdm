'use client'

import { useRef, type RefObject } from 'react'
import useAnimations from '@/animations/useAnimations'

type EntryHeaderAnimationOptions = {
  entranceReady?: boolean
  navOpen: boolean
  headerRef: RefObject<HTMLElement | null>
  hamburgerRef: RefObject<HTMLButtonElement | null>
  topLineRef: RefObject<HTMLSpanElement | null>
  middleLineRef: RefObject<HTMLSpanElement | null>
  bottomLineRef: RefObject<HTMLSpanElement | null>
}

export function useEntryHeaderAnimations({
  entranceReady = true,
  navOpen,
  headerRef,
  hamburgerRef,
  topLineRef,
  middleLineRef,
  bottomLineRef,
}: EntryHeaderAnimationOptions) {
  const hamburgerInitialized = useRef(false)

  const entranceTimeline = useAnimations({
    refs: [headerRef],
    deps: [entranceReady],
    scope: headerRef,
    clearProps: false,
    onReady: (timeline) => {
      const header = headerRef.current
      if (!header || !entranceReady) return
      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      timeline.fromTo(
        header,
        { autoAlpha: 0, y: reducedMotion ? 0 : 24, x: 0, xPercent: -50 },
        { autoAlpha: 1, y: 0, duration: reducedMotion ? 0 : 0.6, ease: 'power3.out' },
      )
      timeline.play()
    },
  })

  const hamburgerTimeline = useAnimations({
    refs: [topLineRef, middleLineRef, bottomLineRef],
    scope: headerRef,
    deps: [navOpen],
    clearProps: false,
    onReady: (timeline) => {
      const button = hamburgerRef.current
      const top = topLineRef.current
      const middle = middleLineRef.current
      const bottom = bottomLineRef.current
      if (!button || !top || !middle || !bottom) return

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const duration = reducedMotion || !hamburgerInitialized.current ? 0 : 0.3
      hamburgerInitialized.current = true

      // Read the untransformed line size and flex gap so both outer lines meet at the centre.
      const gap = parseFloat(getComputedStyle(button).rowGap) || 0
      const lineHeight = parseFloat(getComputedStyle(middle).height) || 0
      const offset = navOpen ? gap + lineHeight : 0

      // Animate from the current values to allow repeated clicks to reverse mid-transition.
      timeline.to(
        top,
        {
          y: offset,
          rotation: navOpen ? 45 : 0,
          transformOrigin: '50% 50%',
          duration,
          ease: 'power2.inOut',
        },
        0,
      )
      timeline.to(
        middle,
        {
          scaleX: navOpen ? 0 : 1,
          autoAlpha: navOpen ? 0 : 1,
          transformOrigin: '50% 50%',
          duration,
          ease: 'power2.inOut',
        },
        0,
      )
      timeline.to(
        bottom,
        {
          y: -offset,
          rotation: navOpen ? -45 : 0,
          transformOrigin: '50% 50%',
          duration,
          ease: 'power2.inOut',
        },
        0,
      )
      timeline.play()
    },
  })

  return { entranceTimeline, hamburgerTimeline }
}
