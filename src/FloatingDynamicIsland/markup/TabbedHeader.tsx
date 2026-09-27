'use client'

import { useEffect, useId, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import type { FloatingDynamicIsland } from '@/payload-types'

import { Button } from '@/components/Button'
import {
  useTabbedHeaderAnimations,
  useTabbedSectionTracking,
  type HeaderTab,
  type ActiveSection,
} from '@/FloatingDynamicIsland/animations/animateTabbedHeader'

type OpenTabbedHeaderProps = Pick<FloatingDynamicIsland, 'logos' | 'joinUs' | 'sections'> & {
  onActiveSectionChange: (section: ActiveSection | null) => void
  onBackToTop: () => void
  navOpen: boolean
  navId: string
  pageLinkSection: FloatingDynamicIsland['pl']
  legalLinkSection: FloatingDynamicIsland['ll']
  socialLinkSection: FloatingDynamicIsland['sl']
}

type BlockSection = {
  title: string
  description: string
  id: string
}

export function TabbedHeader({
  onActiveSectionChange,
  onBackToTop,
  navOpen,
  navId,
  logos,
  joinUs,
  sections,
  pageLinkSection,
  legalLinkSection,
  socialLinkSection,
}: OpenTabbedHeaderProps) {
  const pathname = usePathname()
  const tabId = useId()
  const [activeTab, setActiveTab] = useState<HeaderTab>('sections')
  const [blockSections, setBlockSections] = useState<BlockSection[]>([])

  const headerRef = useRef<HTMLDivElement>(null)
  const innerRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLDivElement>(null)
  const sectionsRef = useRef<HTMLDivElement>(null)
  const linksRef = useRef<HTMLDivElement>(null)

  useTabbedHeaderAnimations({
    navOpen,
    activeTab,
    headerRef,
    innerRef,
    tabsRef,
    sectionsRef,
    linksRef,
  })

  useTabbedSectionTracking({ sectionsRef, blockSections, pathname, onActiveSectionChange })

  function getBlockSections() {
    const blocks = Array.from(document.querySelectorAll('[data-block-title]'))
      .map((block) => ({
        title: block.getAttribute('data-block-title')?.trim() || '',
        description: block.getAttribute('data-block-description')?.trim() || '',
        id: block.id,
      }))
      .filter((block) => block.title)

    // setBlockSections updates the component’s React state with the blocks collected from the page:
    setBlockSections((previous) =>
      previous.length === blocks.length &&
      previous.every(
        (block, index) =>
          block.title === blocks[index].title &&
          block.description === blocks[index].description &&
          block.id === blocks[index].id,
      )
        ? previous
        : blocks,
    )
  }

  useEffect(() => {
    getBlockSections()
  }, [pathname])

  return (
    <div ref={headerRef} id={navId} className="fdi__oth" inert={!navOpen} aria-hidden={!navOpen}>
      <div ref={innerRef} className="fdi__oth-inner">
        <div className="fdi__oth-top-container">
          {logos?.extendedLogo && typeof logos.extendedLogo === 'object' && logos?.logoLink && (
            <CMSLink unstyled className="fdi__oth-logo-link" {...logos?.logoLink}>
              <Media
                className="fdi__oth-logo"
                imgClassName="fdi__oth-logo-image"
                resource={logos.extendedLogo}
              />
            </CMSLink>
          )}

          <div className="fdi__oth-button-container" role="tablist" aria-label="Navigation">
            {(['sections', 'links'] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                role="tab"
                id={`${tabId}-${tab}-tab`}
                data-tab={tab}
                aria-controls={`${tabId}-${tab}-panel`}
                aria-selected={activeTab === tab}
                tabIndex={activeTab === tab ? 0 : -1}
                className={`fdi__oth-tab-button fdi__oth-tab-button--${tab} ultramono p-small${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
                onKeyDown={(event) => {
                  let nextTab: 'sections' | 'links'
                  if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                    nextTab = tab === 'sections' ? 'links' : 'sections'
                  } else if (event.key === 'Home') {
                    nextTab = 'sections'
                  } else if (event.key === 'End') {
                    nextTab = 'links'
                  } else {
                    return
                  }
                  event.preventDefault()
                  setActiveTab(nextTab)
                  document.getElementById(`${tabId}-${nextTab}-tab`)?.focus()
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div ref={tabsRef} className="fdi__oth-main-tab-container">
          <div
            ref={sectionsRef}
            className="fdi__oth-tab-group fdi__oth-tab-group--sections"
            role="tabpanel"
            id={`${tabId}-sections-panel`}
            data-tab="sections"
            aria-labelledby={`${tabId}-sections-tab`}
            inert={activeTab !== 'sections'}
            aria-hidden={activeTab !== 'sections'}
            tabIndex={0}
          >
            {sections?.label && <p className="fdi__oth-label p-small mono">{sections.label}</p>}

            {blockSections.length > 0 && (
              <ul className="fdi__oth-page-sections">
                {blockSections.map(({ title, id }, index) => (
                  <li key={index} data-block-index={index} className="fdi__oth-page-link h5">
                    <span className="fdi__oth-page-number p-small mono">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    {id ? <a href={`${pathname}#${encodeURIComponent(id)}`}>{title}</a> : title}
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div
            ref={linksRef}
            className="fdi__oth-tab-group fdi__oth-tab-group--links"
            role="tabpanel"
            id={`${tabId}-links-panel`}
            data-tab="links"
            aria-labelledby={`${tabId}-links-tab`}
            inert={activeTab !== 'links'}
            aria-hidden={activeTab !== 'links'}
            tabIndex={0}
          >
            <div className="fdi__oth-tab-column-container">
              <div className="fdi__oth-tab-column">
                {(pageLinkSection?.pageLinksLabel || pageLinkSection?.pageLinks?.length) && (
                  <div className="fdi__oth-link-group">
                    {pageLinkSection.pageLinksLabel && (
                      <span className="fdi__oth-label p-small mono">
                        {pageLinkSection.pageLinksLabel}
                      </span>
                    )}
                    {pageLinkSection.pageLinks?.map(({ link }, index) => (
                      <CMSLink key={index} {...link} unstyled className="fdi__oth-page-link h5" />
                    ))}
                  </div>
                )}
              </div>
              <div className="fdi__oth-tab-column">
                {(legalLinkSection?.legalLinksLabel || legalLinkSection?.legalLinks?.length) && (
                  <div className="fdi__oth-link-group">
                    {legalLinkSection.legalLinksLabel && (
                      <span className="fdi__oth-label p-small mono">
                        {legalLinkSection.legalLinksLabel}
                      </span>
                    )}
                    {legalLinkSection.legalLinks?.map(({ link }, index) => (
                      <CMSLink key={index} {...link} unstyled className="fdi__oth-page-link h5" />
                    ))}
                  </div>
                )}

                {(socialLinkSection?.socialLinksLabel ||
                  socialLinkSection?.socialLinks?.length) && (
                  <div className="fdi__oth-link-group">
                    {socialLinkSection.socialLinksLabel && (
                      <span className="fdi__oth-label p-small mono">
                        {socialLinkSection.socialLinksLabel}
                      </span>
                    )}
                    {socialLinkSection.socialLinks?.map(({ link }, index) => (
                      <CMSLink key={index} {...link} unstyled className="fdi__oth-page-link h5" />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="fdi__oth-bottom-container">
          <div className="fdi__oth-back-to-top-container">
            <button type="button" className="fdi__oth-back-to-top" onClick={onBackToTop}>
              <span className="fdi__oth-back-to-top--icon">
                <svg className="fdi__oth-arrow" viewBox="0 0 24 24" fill="none" focusable="false">
                  <path d="M12 19V5M5 12l7-7 7 7" />
                </svg>
              </span>
              <span className="fdi__oth-label fdi__oth-back-to-top-text p-small mono">
                BACK TO TOP
              </span>
            </button>
          </div>

          {joinUs && (joinUs.label || joinUs.link) && (
            <div className="fdi__oth-join-us">
              <Button
                {...joinUs.link}
                classNames="btn--outline btn--outline--white"
                label={joinUs.label}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
