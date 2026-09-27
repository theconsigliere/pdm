import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, expect, it, vi } from 'vitest'

type HeaderProps = { navOpen: boolean; onNavOpen: () => void; onBackToTop: () => void }
const mocks = vi.hoisted(() => ({
  header: vi.fn<(props: HeaderProps) => null>(() => null),
  lenis: {
    scroll: 100,
    limit: 1000,
    velocity: 0,
    isScrolling: false,
    on: vi.fn(),
    scrollTo: vi.fn(),
  },
}))
vi.mock('@/providers/LenisProvider', () => ({ useLenis: () => mocks.lenis }))
vi.mock('@/FloatingDynamicIsland/markup/EntryHeader', () => ({ EntryHeader: mocks.header }))
vi.mock('@/FloatingDynamicIsland/markup/TabbedHeader', () => ({ TabbedHeader: () => null }))
import { FloatingDynamicIsland } from '@/FloatingDynamicIsland/Component'

let root: Root | undefined
afterEach(() => {
  act(() => root?.unmount())
  document.body.replaceChildren()
  vi.unstubAllGlobals()
  vi.clearAllMocks()
})

function setup() {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  Object.assign(mocks.lenis, { scroll: 100, velocity: 0, isScrolling: false })
  let listener = () => {}
  mocks.lenis.on.mockImplementation((_event, callback: () => void) => {
    listener = callback
    return () => {
      listener = () => {}
    }
  })
  const mount = document.createElement('div')
  document.body.append(mount)
  root = createRoot(mount)
  act(() => root?.render(createElement(FloatingDynamicIsland, { island: { id: 1 } })))
  const props = () => mocks.header.mock.lastCall![0]
  const scroll = (velocity: number, isScrolling = velocity !== 0) =>
    act(() => {
      Object.assign(mocks.lenis, { velocity, isScrolling })
      listener()
    })
  return { props, scroll }
}

it.each([-20, 20])(
  'temporarily closes at velocity %s and restores after scrolling stops',
  (velocity) => {
    const view = setup()
    act(() => view.props().onNavOpen())
    view.scroll(velocity / 2)
    expect(view.props().navOpen).toBe(true)
    view.scroll(velocity)
    expect(view.props().navOpen).toBe(false)
    view.scroll(0, true)
    expect(view.props().navOpen).toBe(false)
    view.scroll(0)
    expect(view.props().navOpen).toBe(true)
  },
)

it('does not open a nav that was already closed', () => {
  const view = setup()
  view.scroll(25)
  view.scroll(0)
  expect(view.props().navOpen).toBe(false)
})

it.each(['escape', 'back-to-top'])('cancels restoration after %s', (action) => {
  const view = setup()
  act(() => view.props().onNavOpen())
  view.scroll(-25)
  act(() => {
    if (action === 'escape') window.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }))
    else view.props().onBackToTop()
  })
  view.scroll(0)
  expect(view.props().navOpen).toBe(false)
})
