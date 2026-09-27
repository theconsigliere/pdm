'use client'

import { useCallback, useEffect, useId, useRef, useState } from 'react'
import type { FloatingDynamicIsland as FloatingDynamicIslandData } from '@/payload-types'
import { useLenis } from '@/providers/LenisProvider'
import type { ActiveSection } from './animations/animateTabbedHeader'
import { EntryHeader } from './markup/EntryHeader'
import { TabbedHeader } from './markup/TabbedHeader'
import './floating-dynamic-island.css'

const NAV_CLOSE_VELOCITY = 30

export function FloatingDynamicIsland({ island }: { island: FloatingDynamicIslandData }) {
  const [activeSection, setActiveSection] = useState<ActiveSection | null>(null)
  const [navOpen, setNavOpen] = useState(false)
  const navOpenRef = useRef(false)
  const reopenAfterScroll = useRef(false)
  const updateNavOpen = useCallback((open: boolean) => {
    navOpenRef.current = open
    setNavOpen(open)
  }, [])
  const navId = useId()
  const lenis = useLenis()
  const { logos, joinUs, sections, pl, ll, sl } = island

  useEffect(() => {
    if (!lenis) return

    const isAtBottom = () => lenis.limit > 0 && lenis.scroll >= lenis.limit - 1
    let wasAtBottom = isAtBottom()

    return lenis.on('scroll', () => {
      const atBottom = isAtBottom()
      if (atBottom && !wasAtBottom) updateNavOpen(true)

      if (Math.abs(lenis.velocity) >= NAV_CLOSE_VELOCITY && navOpenRef.current) {
        reopenAfterScroll.current = true
        updateNavOpen(false)
      }

      if (!lenis.isScrolling && lenis.velocity === 0 && reopenAfterScroll.current) {
        reopenAfterScroll.current = false
        updateNavOpen(true)
      }
      wasAtBottom = atBottom
    })
  }, [lenis, updateNavOpen])

  useEffect(() => {
    if (!navOpen && !reopenAfterScroll.current) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return

      reopenAfterScroll.current = false
      updateNavOpen(false)
      const navButton = Array.from(document.querySelectorAll<HTMLButtonElement>('[data-nav]')).find(
        (button) => button.getAttribute('aria-controls') === navId,
      )
      navButton?.focus()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [navOpen, navId, updateNavOpen])

  const handleBackToTop = () => {
    reopenAfterScroll.current = false
    updateNavOpen(false)
    lenis?.scrollTo(0)
  }

  return (
    <>
      <EntryHeader
        activeSection={activeSection}
        defaultLogo={logos?.defaultLogo}
        logoLink={logos?.logoLink}
        navOpen={navOpen}
        navId={navId}
        onBackToTop={handleBackToTop}
        onNavOpen={() => {
          reopenAfterScroll.current = false
          updateNavOpen(!navOpenRef.current)
        }}
      />
      <TabbedHeader
        onActiveSectionChange={setActiveSection}
        navOpen={navOpen}
        navId={navId}
        onBackToTop={handleBackToTop}
        logos={logos}
        joinUs={joinUs}
        sections={sections}
        pageLinkSection={pl}
        legalLinkSection={ll}
        socialLinkSection={sl}
      />
    </>
  )
}
