import { CMSLink } from '@/components/Link'
import { Media } from '@/components/Media'
import { getCachedGlobal } from '@/utilities/getGlobals'

export async function FloatingDynamicIsland() {
  const island = await getCachedGlobal('floating-dynamic-island', 1)()
  const { logos, joinUs, sections, pl, ll, sl } = island

  return (
    <aside className="pd__floating-dynamic-island" aria-label="Site information">
      <div className="pd__floating-dynamic-island-logos">
        {logos?.defaultLogo && typeof logos.defaultLogo === 'object' && (
          <Media
            className="pd__floating-dynamic-island-logo pd__floating-dynamic-island-logo--default"
            imgClassName="pd__floating-dynamic-island-logo-image"
            resource={logos.defaultLogo}
          />
        )}
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

      {sections?.label && <p className="pd__floating-dynamic-island-sections-label">{sections.label}</p>}

      <nav className="pd__floating-dynamic-island-links" aria-label="Site links">
        {(pl?.pageLinksLabel || pl?.pageLinks?.length) && (
          <div className="pd__floating-dynamic-island-link-group">
            {pl.pageLinksLabel && <span>{pl.pageLinksLabel}</span>}
            {pl.pageLinks?.map(({ link }, index) => <CMSLink key={index} {...link} />)}
          </div>
        )}

        {(ll?.legalLinksLabel || ll?.legalLinks?.length) && (
          <div className="pd__floating-dynamic-island-link-group">
            {ll.legalLinksLabel && <span>{ll.legalLinksLabel}</span>}
            {ll.legalLinks?.map(({ link }, index) => <CMSLink key={index} {...link} />)}
          </div>
        )}

        {(sl?.socialLinksLabel || sl?.socialLinks?.length) && (
          <div className="pd__floating-dynamic-island-link-group">
            {sl.socialLinksLabel && <span>{sl.socialLinksLabel}</span>}
            {sl.socialLinks?.map(({ link }, index) => <CMSLink key={index} {...link} />)}
          </div>
        )}
      </nav>
    </aside>
  )
}
