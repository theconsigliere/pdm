import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import gsap from 'gsap'
import { afterEach, expect, it, vi } from 'vitest'
import { useEntryHeaderAnimations } from '@/FloatingDynamicIsland/animations/animateEntryHeader'

const roots: Root[] = []
afterEach(() => {
  act(() => roots.splice(0).forEach((root) => root.unmount()))
  document.body.replaceChildren()
  vi.unstubAllGlobals()
})

function setup(reducedMotion = false, entranceReady = true) {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('matchMedia', () => ({ matches: reducedMotion }))
  const header = document.createElement('aside')
  const button = document.createElement('button')
  const top = document.createElement('span')
  const middle = document.createElement('span')
  const bottom = document.createElement('span')
  button.style.rowGap = '5px'
  middle.style.height = '1.5px'
  button.append(top, middle, bottom)
  header.append(button)
  document.body.append(header)
  const mount = document.createElement('div')
  document.body.append(mount)
  const root = createRoot(mount)
  roots.push(root)
  const result: ReturnType<typeof useEntryHeaderAnimations> = {
    entranceTimeline: { current: null },
    hamburgerTimeline: { current: null },
  }
  function Harness({ navOpen, entranceReady }: { navOpen: boolean; entranceReady: boolean }) {
    Object.assign(
      result,
      useEntryHeaderAnimations({
        navOpen,
        entranceReady,
        headerRef: { current: header },
        hamburgerRef: { current: button },
        topLineRef: { current: top },
        middleLineRef: { current: middle },
        bottomLineRef: { current: bottom },
      }),
    )
    return null
  }
  const render = (navOpen: boolean, ready = entranceReady) =>
    act(() => root.render(createElement(Harness, { navOpen, entranceReady: ready })))
  render(false)
  return { result, render, header, top, middle, bottom }
}

it('enters once, morphs into an X and reverses smoothly on repeated clicks', () => {
  const view = setup()
  const entrance = view.result.entranceTimeline.current
  act(() => {
    entrance?.progress(1)
  })
  expect(view.header.style.opacity).toBe('1')
  expect(gsap.getProperty(view.header, 'y')).toBe(0)
  expect(gsap.getProperty(view.header, 'xPercent')).toBe(-50)
  view.render(true)
  act(() => {
    view.result.hamburgerTimeline.current?.progress(1)
  })
  expect(view.result.entranceTimeline.current).toBe(entrance)
  expect(gsap.getProperty(view.top, 'rotation')).toBe(45)
  expect(gsap.getProperty(view.bottom, 'rotation')).toBe(-45)
  expect(gsap.getProperty(view.top, 'y')).toBe(6.5)
  expect(gsap.getProperty(view.bottom, 'y')).toBe(-6.5)
  expect(view.middle.style.opacity).toBe('0')
  view.render(false)
  act(() => {
    view.result.hamburgerTimeline.current?.progress(0.5)
  })
  const rotation = gsap.getProperty(view.top, 'rotation')
  view.render(true)
  expect(gsap.getProperty(view.top, 'rotation')).toBe(rotation)
  view.render(false)
  act(() => {
    view.result.hamburgerTimeline.current?.progress(1)
  })
  expect(gsap.getProperty(view.top, 'rotation')).toBe(0)
  expect(gsap.getProperty(view.bottom, 'y')).toBe(0)
  expect(view.middle.style.opacity).toBe('1')
})

it('shows the header and toggles immediately with reduced motion', () => {
  const view = setup(true)
  expect(view.result.entranceTimeline.current?.duration()).toBe(0)
  expect(view.header.style.opacity).toBe('1')
  view.render(true)
  expect(view.result.hamburgerTimeline.current?.duration()).toBe(0)
  expect(gsap.getProperty(view.top, 'rotation')).toBe(45)
  view.render(false)
  expect(gsap.getProperty(view.top, 'rotation')).toBe(0)
})

it('waits for preloader completion before starting its entrance', () => {
  const view = setup(false, false)
  expect(view.result.entranceTimeline.current?.getChildren()).toHaveLength(0)
  view.render(false, true)
  expect(view.result.entranceTimeline.current?.duration()).toBeGreaterThan(0)
  act(() => {
    view.result.entranceTimeline.current?.progress(1)
  })
  expect(view.header.style.opacity).toBe('1')
})
