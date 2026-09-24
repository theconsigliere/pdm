import { Media } from '@/components/Media'
import type { FloatingDynamicIsland } from '@/payload-types'

type EntryHeaderProps = {
  defaultLogo: NonNullable<FloatingDynamicIsland['logos']>['defaultLogo']
}

export function EntryHeader({ defaultLogo }: EntryHeaderProps) {
  return (
    <aside className="fdi__entry-header" aria-label="Site information">
      <div className="fdi__entry-header__inner">
        <div className="fdi__entry-header__logo-container">
          {defaultLogo && typeof defaultLogo === 'object' && (
            <Media
              className="fdi__entry-header__logo"
              imgClassName="fdi__entry-header__logo-image"
              resource={defaultLogo}
            />
          )}
        </div>
        <div className="fdi__entry-header__title-container">
          <div className="fdi__entry-header__divider"></div>
          <div className="fdi__entry-header__title-group">
            <p className="p-small fdi__entry-header__title-number mono">01</p>
            <p className="fdi__entry-header__title">Intro</p>
          </div>
        </div>
        <div className="fdi__entry-header__action-container">
          <div className="fdi__entry-header__arrow-container" aria-hidden="true">
            <svg
              className="fdi__entry-header__arrow"
              viewBox="0 0 24 24"
              fill="none"
              focusable="false"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </div>
          <div className="fdi__entry-header__hamburger-container" aria-hidden="true">
            <span className="fdi__entry-header__hamburger-line" />
            <span className="fdi__entry-header__hamburger-line" />
            <span className="fdi__entry-header__hamburger-line" />
          </div>
        </div>
      </div>
    </aside>
  )
}
