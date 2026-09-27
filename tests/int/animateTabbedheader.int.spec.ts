import { act, createElement } from 'react'
import { createRoot, type Root } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  useTabbedHeaderAnimations,
  type HeaderTab,
} from '@/FloatingDynamicIsland/animations/animateTabbedHeader'

const roots: Root[] = []

afterEach(() => {
  act(() => roots.splice(0).forEach((root) => root.unmount()))
  document.body.replaceChildren()
  vi.unstubAllGlobals()
})

function setup(reducedMotion = false) {
  vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true)
  vi.stubGlobal('matchMedia', () => ({ matches: reducedMotion }))
  const header = document.createElement('div')
  const inner = document.createElement('div')
  const tabs = document.createElement('div')
  const sections = document.createElement('div')
  const links = document.createElement('div')
  sections.dataset.tab = 'sections'
  links.dataset.tab = 'links'
  header.style.cssText = 'height: 0; visibility: hidden; overflow: hidden'
  links.style.cssText = 'position: absolute; opacity: 0; visibility: hidden'
  tabs.append(sections, links)
  inner.append(tabs)
  header.append(inner)
  document.body.append(header)

  // jsdom has no layout; provide two different panel heights and 80px of header chrome.
  const naturalTabsHeight = () => (links.style.position === 'relative' ? 240 : 120)
  const tabsHeight = () => parseFloat(tabs.style.height) || naturalTabsHeight()
  const measure = (node: HTMLElement, height: () => number) => {
    vi.spyOn(node, 'getBoundingClientRect').mockImplementation(() => ({
      x: 0,
      y: 0,
      top: 0,
      left: 0,
      right: 400,
      bottom: height(),
      width: 400,
      height: height(),
      toJSON: () => ({}),
    }))
  }
  measure(sections, () => 120)
  measure(links, () => 240)
  measure(tabs, tabsHeight)
  measure(inner, () => 80 + tabsHeight())
  measure(header, () =>
    header.style.height === 'auto' ? 80 + tabsHeight() : parseFloat(header.style.height),
  )

  const mount = document.createElement('div')
  document.body.append(mount)
  const root = createRoot(mount)
  roots.push(root)
  const result = { current: { current: null } as ReturnType<typeof useTabbedHeaderAnimations> }
  function Harness({ navOpen, activeTab }: { navOpen: boolean; activeTab: HeaderTab }) {
    result.current = useTabbedHeaderAnimations({
      navOpen,
      activeTab,
      headerRef: { current: header },
      innerRef: { current: inner },
      tabsRef: { current: tabs },
      sectionsRef: { current: sections },
      linksRef: { current: links },
    })
    return null
  }
  const rerender = (props: { navOpen: boolean; activeTab: HeaderTab }) => {
    act(() => root.render(createElement(Harness, props)))
  }
  const hook = { result, rerender }
  rerender({ navOpen: false, activeTab: 'sections' })
  const finish = () =>
    act(() => {
      hook.result.current.current?.progress(1)
    })
  return { ...hook, header, tabs, sections, links, finish }
}

describe('tabbed header animations', () => {
  it('opens, resizes between tabs, and closes to zero height', () => {
    const view = setup()
    expect(view.header.style.height).toBe('0px')
    view.rerender({ navOpen: true, activeTab: 'sections' })
    view.finish()
    expect(view.header.style.height).toBe('auto')
    expect(view.header.getBoundingClientRect().height).toBe(200)
    expect(view.header.style.visibility).toBe('visible')

    view.rerender({ navOpen: true, activeTab: 'links' })
    view.finish()
    expect(view.header.getBoundingClientRect().height).toBe(320)
    expect(view.tabs.style.height).toBe('auto')
    expect(view.sections.style.visibility).toBe('hidden')
    expect(view.links.style.opacity).toBe('1')
    expect(view.links.style.visibility).not.toBe('hidden')

    view.rerender({ navOpen: false, activeTab: 'links' })
    view.finish()
    expect(view.header.style.height).toBe('0px')
    expect(view.header.style.visibility).toBe('hidden')
  })

  it('replaces interrupted transitions without stale completion callbacks', () => {
    const view = setup()
    view.rerender({ navOpen: true, activeTab: 'sections' })
    act(() => {
      view.result.current.current?.progress(0.5)
    })
    const height = view.header.style.height
    view.rerender({ navOpen: false, activeTab: 'sections' })
    expect(view.header.style.height).toBe(height)
    view.rerender({ navOpen: true, activeTab: 'links' })
    act(() => {
      view.result.current.current?.progress(0.5)
    })
    view.rerender({ navOpen: true, activeTab: 'sections' })
    view.finish()
    expect(view.header.style.height).toBe('auto')
    expect(view.sections.style.opacity).toBe('1')
    expect(view.sections.style.visibility).not.toBe('hidden')
    expect(view.links.style.visibility).toBe('hidden')
  })

  it('uses immediate transitions for reduced motion', () => {
    const view = setup(true)
    view.rerender({ navOpen: true, activeTab: 'links' })
    expect(view.result.current.current?.duration()).toBe(0)
    expect(view.header.style.height).toBe('auto')
    expect(view.links.style.opacity).toBe('1')
    expect(view.links.style.visibility).not.toBe('hidden')
  })
})
