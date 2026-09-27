'use client'

import { useEffect, useRef, type RefObject } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import useAnimations from '@/animations/useAnimations'

export type HeaderTab = 'sections' | 'links'

export type ActiveSection = { title: string; number: number }

type TabbedHeaderAnimationOptions = {
  navOpen: boolean
  activeTab: HeaderTab
  headerRef: RefObject<HTMLDivElement | null>
  innerRef: RefObject<HTMLDivElement | null>
  tabsRef: RefObject<HTMLDivElement | null>
  sectionsRef: RefObject<HTMLDivElement | null>
  linksRef: RefObject<HTMLDivElement | null>
}

export function useTabbedHeaderAnimations({
  navOpen,
  activeTab,
  headerRef,
  innerRef,
  tabsRef,
  sectionsRef,
  linksRef,
}: TabbedHeaderAnimationOptions) {
  const previousOpen = useRef<boolean | null>(null)

  return useAnimations({
    refs: [headerRef, innerRef, tabsRef, sectionsRef, linksRef],
    scope: headerRef,
    deps: [navOpen, activeTab],
    clearProps: false,
    onReady: (timeline) => {
      const header = headerRef.current
      const inner = innerRef.current
      const tabs = tabsRef.current
      const panels = [sectionsRef.current, linksRef.current]
      const activePanel = panels.find((panel) => panel?.dataset.tab === activeTab)
      if (!header || !inner || !tabs || !activePanel || panels.some((panel) => !panel)) return

      const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      const wasOpen = previousOpen.current
      const duration = reducedMotion || wasOpen === null || (!wasOpen && !navOpen) ? 0 : 0.4
      previousOpen.current = navOpen

      // Freeze the current rendered heights so interrupted transitions resume without jumping.
      const headerHeight = header.getBoundingClientRect().height
      const tabsHeight = tabs.getBoundingClientRect().height
      gsap.set(header, { height: headerHeight, overflow: 'hidden' })
      gsap.set(tabs, { height: tabsHeight, overflow: 'hidden' })

      // Keep the incoming panel in normal flow; outgoing panels overlap it while fading out.
      panels.forEach((panel) => {
        gsap.set(panel, { position: panel === activePanel ? 'relative' : 'absolute' })
      })
      const targetTabsHeight = activePanel.getBoundingClientRect().height
      const targetHeaderHeight =
        inner.getBoundingClientRect().height + targetTabsHeight - tabsHeight
      if (navOpen) gsap.set(header, { visibility: 'visible' })

      timeline.addLabel(wasOpen === navOpen ? 'tabs' : navOpen ? 'open' : 'close')
      timeline.to(
        header,
        { height: navOpen ? targetHeaderHeight : 0, duration, ease: 'power2.inOut' },
        0,
      )
      timeline.to(tabs, { height: targetTabsHeight, duration, ease: 'power2.inOut' }, 0)
      panels.forEach((panel) => {
        timeline.to(
          panel,
          { autoAlpha: panel === activePanel ? 1 : 0, duration: duration * 0.75 },
          0,
        )
      })
      timeline.eventCallback('onComplete', () => {
        // Restore natural sizing for responsive layouts, fonts, and changing block content.
        gsap.set(header, {
          height: navOpen ? 'auto' : 0,
          visibility: navOpen ? 'visible' : 'hidden',
        })
        gsap.set(tabs, { height: 'auto', overflow: 'visible' })
      })
      timeline.play()
    },
  })
}

/** Highlight the section crossing the viewport midpoint, independently of the open/close timeline. */
export function useTabbedSectionTracking({
  sectionsRef,
  blockSections,
  pathname,
  onActiveSectionChange,
}: {
  sectionsRef: RefObject<HTMLDivElement | null>
  blockSections: readonly { title: string; id: string }[]
  pathname: string
  onActiveSectionChange: (section: ActiveSection | null) => void
}) {
  useEffect(() => {
    onActiveSectionChange(null)
    let activeIndex: number | null = null
    const container = sectionsRef.current
    if (!container || !blockSections.length) return
    gsap.registerPlugin(ScrollTrigger)

    const blocks = Array.from(document.querySelectorAll<HTMLElement>('[data-block-title]')).filter(
      (block) => block.dataset.blockTitle?.trim(),
    )
    const cleanups = blocks.map((block, index) => {
      const item = container.querySelector<HTMLElement>(`[data-block-index="${index}"]`)
      if (!item) return () => {}
      const link = item.querySelector('a')
      const setActive = (active: boolean) => {
        item.classList.toggle('fdi__oth-page-link--active', active)
        if (active) {
          link?.setAttribute('aria-current', 'location')
          activeIndex = index
          onActiveSectionChange({ title: block.dataset.blockTitle!.trim(), number: index + 1 })
        } else {
          link?.removeAttribute('aria-current')
          if (activeIndex === index) {
            activeIndex = null
            onActiveSectionChange(null)
          }
        }
      }
      const trigger = ScrollTrigger.create({
        trigger: block,
        start: 'top center',
        end: 'bottom center',
        onToggle: (self) => setActive(self.isActive),
        onRefresh: (self) => setActive(self.isActive),
      })
      setActive(trigger.isActive)
      return () => {
        trigger.kill()
        item.classList.remove('fdi__oth-page-link--active')
        link?.removeAttribute('aria-current')
      }
    })

    return () => cleanups.forEach((cleanup) => cleanup())
  }, [sectionsRef, blockSections, pathname, onActiveSectionChange])
}
