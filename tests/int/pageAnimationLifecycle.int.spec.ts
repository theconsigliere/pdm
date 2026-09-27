import { act, createElement, type RefObject } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, expect, it, vi } from 'vitest'
import gsap from 'gsap'
import { usePreloaderAnimation } from '@/Preloader/animations/animatePreloader'
import {
  usePageTransitionAnimation,
  type PageTransitionPhase,
} from '@/PageTransition/animations/animatePageTransition'

const roots: Root[] = []
afterEach(() => {
  act(() => roots.splice(0).forEach((root) => root.unmount()))
  document.body.replaceChildren()
  vi.unstubAllGlobals()
})

function setup<T>(
  hook: (
    props: T,
    overlayRef: RefObject<HTMLDivElement | null>,
  ) => RefObject<gsap.core.Timeline | null>,
  initialProps: T,
) {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('matchMedia', () => ({ matches: false }))
  const overlay = document.createElement('div')
  const mount = document.createElement('div')
  document.body.append(overlay, mount)
  const root = createRoot(mount)
  roots.push(root)
  const overlayRef = { current: overlay }
  const result = { current: { current: null } as RefObject<gsap.core.Timeline | null> }
  function Harness({ options }: { options: T }) {
    result.current = hook(options, overlayRef)
    return null
  }
  const render = (options: T) => act(() => root.render(createElement(Harness, { options })))
  const finish = () =>
    act(() => {
      result.current.current?.progress(1)
    })
  render(initialProps)
  return { render, finish, overlay, result }
}

it('preloader only releases other animations after load and its exit complete', () => {
  const onComplete = vi.fn()
  const view = setup(
    (loaded: boolean, overlayRef) => usePreloaderAnimation({ loaded, overlayRef, onComplete }),
    false,
  )
  expect(view.result.current.current?.getChildren()).toHaveLength(0)
  expect(onComplete).not.toHaveBeenCalled()
  view.render(true)
  act(() => {
    view.result.current.current?.progress(0.5)
  })
  expect(onComplete).not.toHaveBeenCalled()
  view.finish()
  expect(onComplete).toHaveBeenCalledTimes(1)
  expect(view.overlay.style.opacity).toBe('0')
})

it('page transitions signal cover and reveal completion separately', () => {
  const onCovered = vi.fn()
  const onRevealed = vi.fn()
  const view = setup(
    (phase: PageTransitionPhase, overlayRef) =>
      usePageTransitionAnimation({ phase, overlayRef, onCovered, onRevealed }),
    'idle',
  )
  expect(onCovered).not.toHaveBeenCalled()
  view.render('cover')
  view.finish()
  expect(onCovered).toHaveBeenCalledTimes(1)
  expect(onRevealed).not.toHaveBeenCalled()
  expect(gsap.getProperty(view.overlay, 'scaleY')).toBe(1)
  view.render('reveal')
  view.finish()
  expect(onRevealed).toHaveBeenCalledTimes(1)
  expect(view.overlay.style.visibility).toBe('hidden')
})

it('cancels an unfinished cover when a transition is reset', () => {
  const onCovered = vi.fn()
  const view = setup(
    (phase: PageTransitionPhase, overlayRef) =>
      usePageTransitionAnimation({ phase, overlayRef, onCovered }),
    'idle',
  )
  view.render('cover')
  act(() => {
    view.result.current.current?.progress(0.5)
  })
  const previousTimeline = view.result.current.current
  view.render('idle')
  expect(previousTimeline?.parent).toBeNull()
  expect(onCovered).not.toHaveBeenCalled()
  expect(view.overlay.style.visibility).toBe('hidden')
})
