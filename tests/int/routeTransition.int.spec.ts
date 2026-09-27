import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, expect, it, vi } from 'vitest'

const state = vi.hoisted(() => ({ pathname: '/', ready: true, animate: vi.fn() }))
vi.mock('next/navigation', () => ({ usePathname: () => state.pathname }))
vi.mock('@/Preloader/Component', () => ({ usePreloaderReady: () => state.ready }))
vi.mock('@/PageTransition/animations/animatePageTransition', () => ({
  usePageTransitionAnimation: state.animate,
}))
import { RouteTransition } from '@/PageTransition/RouteTransition'

let root: Root | undefined

afterEach(() => {
  act(() => root?.unmount())
  root = undefined
  document.body.replaceChildren()
  vi.unstubAllGlobals()
  state.animate.mockClear()
  state.pathname = '/'
  state.ready = true
})

it('skips initial load and triggers reveals on navigation and returning to the initial route', () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  const mount = document.createElement('div')
  document.body.append(mount)
  root = createRoot(mount)
  const render = () => act(() => root?.render(createElement(RouteTransition)))
  const options = () => state.animate.mock.lastCall?.[0]
  render()
  expect(options().phase).toBe('idle')
  state.pathname = '/about'
  render()
  expect(options()).toMatchObject({ phase: 'reveal', transitionKey: '/about' })
  state.pathname = '/'
  render()
  expect(options()).toMatchObject({ phase: 'reveal', transitionKey: '/' })
})

it('waits for the preloader before revealing a route changed during initial loading', () => {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  state.ready = false
  const mount = document.createElement('div')
  document.body.append(mount)
  root = createRoot(mount)
  const render = () => act(() => root?.render(createElement(RouteTransition)))
  render()
  state.pathname = '/about'
  render()
  expect(state.animate.mock.lastCall?.[0].phase).toBe('idle')
  state.ready = true
  render()
  expect(state.animate.mock.lastCall?.[0]).toMatchObject({
    phase: 'reveal',
    transitionKey: '/about',
  })
})
