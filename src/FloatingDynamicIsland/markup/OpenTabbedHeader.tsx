import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import type { FloatingDynamicIsland } from '@/payload-types'

type OpenTabbedHeaderProps = Pick<FloatingDynamicIsland, 'logos' | 'joinUs' | 'sections'> & {
  pageLinkSection: FloatingDynamicIsland['pl']
  legalLinkSection: FloatingDynamicIsland['ll']
  socialLinkSection: FloatingDynamicIsland['sl']
}

export function OpenTabbedHeader({
  logos,
  joinUs,
  sections,
  pageLinkSection,
  legalLinkSection,
  socialLinkSection,
}: OpenTabbedHeaderProps) {
  return (
    <div className="fdi__open-tabbed-header">
      <div className="pd__floating-dynamic-island-logos">
        {logos?.extendedLogo && typeof logos.extendedLogo === 'object' && (
          <Media
            className="pd__floating-dynamic-island-logo pd__floating-dynamic-island-logo--extended"
            imgClassName="pd__floating-dynamic-island-logo-image"
            resource={logos.extendedLogo}
          />
        )}
        {logos?.logoLink && (
          <CMSLink className="pd__floating-dynamic-island-logo-link" {...logos.logoLink} />
        )}
      </div>

      {joinUs && (joinUs.label || joinUs.link) && (
        <div className="pd__floating-dynamic-island-join-us">
          {joinUs.label && <span>{joinUs.label}</span>}
          {joinUs.link && <CMSLink {...joinUs.link} />}
        </div>
      )}
      {sections?.label && (
        <p className="pd__floating-dynamic-island-sections-label">{sections.label}</p>
      )}

      <nav className="pd__floating-dynamic-island-links" aria-label="Site links">
        {(pageLinkSection?.pageLinksLabel || pageLinkSection?.pageLinks?.length) && (
          <div className="pd__floating-dynamic-island-link-group">
            {pageLinkSection.pageLinksLabel && <span>{pageLinkSection.pageLinksLabel}</span>}
            {pageLinkSection.pageLinks?.map(({ link }, index) => (
              <CMSLink key={index} {...link} />
            ))}
          </div>
        )}

        {(legalLinkSection?.legalLinksLabel || legalLinkSection?.legalLinks?.length) && (
          <div className="pd__floating-dynamic-island-link-group">
            {legalLinkSection.legalLinksLabel && <span>{legalLinkSection.legalLinksLabel}</span>}
            {legalLinkSection.legalLinks?.map(({ link }, index) => (
              <CMSLink key={index} {...link} />
            ))}
          </div>
        )}

        {(socialLinkSection?.socialLinksLabel || socialLinkSection?.socialLinks?.length) && (
          <div className="pd__floating-dynamic-island-link-group">
            {socialLinkSection.socialLinksLabel && (
              <span>{socialLinkSection.socialLinksLabel}</span>
            )}
            {socialLinkSection.socialLinks?.map(({ link }, index) => (
              <CMSLink key={index} {...link} />
            ))}
          </div>
        )}
      </nav>
    </div>
  )
}
