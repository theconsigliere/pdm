'use client'

import { useRef } from 'react'
import { usePreloaderReady } from '@/Preloader/Component'
import type { ActiveSection } from '@/FloatingDynamicIsland/animations/animateTabbedHeader'
import { useEntryHeaderAnimations } from '@/FloatingDynamicIsland/animations/animateEntryHeader'
import { Media } from '@/components/Media'
import { CMSLink } from '@/components/Link'

import type { FloatingDynamicIsland } from '@/payload-types'

type EntryHeaderProps = {
  activeSection: ActiveSection | null
  logoLink: NonNullable<FloatingDynamicIsland['logos']>['logoLink']
  onBackToTop: () => void
  navOpen: boolean
  navId: string
  onNavOpen: () => void
  defaultLogo: NonNullable<FloatingDynamicIsland['logos']>['defaultLogo']
}

export function EntryHeader({
  activeSection,
  defaultLogo,
  logoLink,
  navOpen,
  navId,
  onNavOpen,
  onBackToTop,
}: EntryHeaderProps) {
  const entranceReady = usePreloaderReady()
  const headerRef = useRef<HTMLElement>(null)
  const hamburgerRef = useRef<HTMLButtonElement>(null)
  const topLineRef = useRef<HTMLSpanElement>(null)
  const middleLineRef = useRef<HTMLSpanElement>(null)
  const bottomLineRef = useRef<HTMLSpanElement>(null)

  useEntryHeaderAnimations({
    entranceReady,
    navOpen,
    headerRef,
    hamburgerRef,
    topLineRef,
    middleLineRef,
    bottomLineRef,
  })

  return (
    <aside ref={headerRef} className="fdi__entry-header" aria-label="Site information">
      <div className="fdi__entry-header__inner">
        <div className="fdi__entry-header__logo-container">
          {defaultLogo && typeof defaultLogo === 'object' && logoLink && (
            <CMSLink unstyled className="fdi__entry-header__logo-link" {...logoLink}>
              <Media
                className="fdi__entry-header__logo"
                imgClassName="fdi__entry-header__logo-image"
                resource={defaultLogo}
              />
            </CMSLink>
          )}
        </div>
        <div className="fdi__entry-header__title-container">
          <div className="fdi__entry-header__divider"></div>
          <div className="fdi__entry-header__title-group">
            <p className="p-small fdi__entry-header__title-number mono">
              {activeSection ? String(activeSection.number).padStart(2, '0') : '00'}
            </p>
            <p className="fdi__entry-header__title">
              {activeSection?.title ?? 'Welcome to Paradigm'}
            </p>
          </div>
        </div>
        <div className="fdi__entry-header__action-container">
          <button
            className="fdi__entry-header__arrow-container fdi__entry-header__back-to-top"
            aria-hidden="true"
            onClick={onBackToTop}
          >
            <svg
              className="fdi__entry-header__arrow"
              viewBox="0 0 24 24"
              fill="none"
              focusable="false"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
          <button
            type="button"
            data-nav
            ref={hamburgerRef}
            className="fdi__entry-header__hamburger-container"
            aria-label={navOpen ? 'Close navigation' : 'Open navigation'}
            aria-expanded={navOpen}
            aria-controls={navId}
            onClick={onNavOpen}
          >
            <span
              ref={topLineRef}
              className="fdi__entry-header__hamburger-line"
              aria-hidden="true"
            />
            <span
              ref={middleLineRef}
              className="fdi__entry-header__hamburger-line"
              aria-hidden="true"
            />
            <span
              ref={bottomLineRef}
              className="fdi__entry-header__hamburger-line"
              aria-hidden="true"
            />
          </button>
        </div>
      </div>
    </aside>
  )
}
