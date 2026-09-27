import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'

import { ThemeSelector } from '@/providers/Theme/ThemeSelector'
import { Button } from '@/components/Button'
import { Logo } from '@/components/Logo/Logo'
import { Media } from '@/components/Media'

export async function Footer() {
  const footerData = await getCachedGlobal('footer', 1)()

  const navItems = footerData?.navItems || []
  const getInTouch = footerData?.getInTouch

  return (
    <footer className="pd__footer">
      <div className="pd__footer-inner pd__mega-container">
        <div className="pd__footer-top-section">
          <div className="pd__footer-top-section--left">
            {getInTouch?.subHeadline && (
              <p className="pd__footer-eyebrow mono">{getInTouch.subHeadline}</p>
            )}

            {getInTouch?.title && <h3 className="pd__footer-title">{getInTouch.title}</h3>}
          </div>
          <div className="pd__footer-top-section--right">
            {getInTouch?.button && (
              <Button
                className="pd__footer-link btn--primary btn--primary--white"
                {...getInTouch.button}
              />
            )}
          </div>
        </div>

        <Link className="pd__footer-brand" href="/">
          {footerData?.logo && typeof footerData.logo === 'object' ? (
            <div className="pd__footer-logo">
              <Media
                className="pd__footer-logo-media"
                imgClassName="pd__footer-logo-image"
                loading="eager"
                priority
                resource={footerData.logo}
              />
            </div>
          ) : (
            <Logo />
          )}
        </Link>

        <div className="pd__footer-bottom-content">
          <div className="pd__footer-bottom-group">
            {/* <ThemeSelector /> */}
            <nav className="pd__footer-nav">
              {navItems.map(({ link }, i) => {
                return (
                  <Button
                    className="pd__footer-link-text mono p-small btn--primary"
                    key={i}
                    {...link}
                  />
                )
              })}
            </nav>
          </div>
        </div>
      </div>
    </footer>
  )
}
