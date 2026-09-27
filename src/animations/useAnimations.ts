'use client'

import { useRef, type DependencyList, type RefObject } from 'react'
import gsap from 'gsap'
import { useGSAP } from '@gsap/react'

gsap.registerPlugin(useGSAP)

export type AnimationTarget =
  | Element
  | null
  | undefined
  | RefObject<AnimationTarget>
  | readonly AnimationTarget[]
  | { readonly [key: string]: AnimationTarget }

export type UseAnimationsOptions = {
  refs?: readonly AnimationTarget[]
  scope?: RefObject<Element | null>
  deps?: DependencyList
  onReady?: (timeline: gsap.core.Timeline, initialTargets: Element[]) => void
  timelineDefaults?: gsap.TweenVars
  clearProps?: string | false
}

/** Builds a paused timeline from element refs, arrays, or nested target records. */
export default function useAnimations({
  refs = [],
  scope,
  deps = [],
  onReady,
  timelineDefaults = {},
  clearProps = 'opacity,visibility,transform',
}: UseAnimationsOptions): RefObject<gsap.core.Timeline | null> {
  const timelineRef = useRef<gsap.core.Timeline | null>(null)

  useGSAP(
    () => {
      // Recursively resolve refs to an array of DOM nodes.
      const resolveNodes = (item: unknown): Element[] => {
        const resolved = item && typeof item === 'object' && 'current' in item ? item.current : item

        if (!resolved) return []
        if (Array.isArray(resolved)) return resolved.flatMap(resolveNodes)
        if (resolved instanceof Element) return [resolved]
        if (typeof resolved === 'object') return Object.values(resolved).flatMap(resolveNodes)

        return []
      }

      // Normalize refs into a clean unique array of DOM nodes to animate.
      const initialTargets = [...new Set(refs.flatMap(resolveNodes))]

      // Remove the initial hiding class before GSAP sets styles.
      initialTargets.forEach((node) => {
        node.classList?.remove('gsap-initial-hide')
      })

      // kill any existing timeline before creating a new one
      timelineRef.current?.kill()
      timelineRef.current = gsap.timeline({
        paused: true,
        defaults: timelineDefaults,
      })

      // call onReady so you can add tweens to the timeline
      if (initialTargets.length && onReady) {
        onReady(timelineRef.current, initialTargets)

        // Optionally clear inline styles at the end of timeline.
        if (clearProps) {
          timelineRef.current.eventCallback('onComplete', () => {
            gsap.set(initialTargets, {
              clearProps,
            })
          })
        }
      }

      return () => {
        timelineRef.current?.kill()
        timelineRef.current = null
      }
    },
    { scope, dependencies: [...deps] },
  )

  return timelineRef
}
