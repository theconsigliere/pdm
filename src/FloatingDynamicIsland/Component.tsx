import { getCachedGlobal } from '@/utilities/getGlobals'
import { EntryHeader } from './markup/EntryHeader'
import { OpenTabbedHeader } from './markup/OpenTabbedHeader'
import './floating-dynamic-island.css'

// TODO SORT OUT BASIC STYLE MARKUP FOR THE TWO SECTIONS
// TODO PULL IN data-block-title data-block-DESCRIPTION

// TODO FULL ANIMATION FOR OPNE / CLOSE / TAB BETWEEN VIEWS

// TODO 3RD VIEW FINISH

export async function FloatingDynamicIsland() {
  const island = await getCachedGlobal('floating-dynamic-island', 1)()
  const {
    logos,
    joinUs,
    sections,
    pl: pageLinkSection,
    ll: legalLinkSection,
    sl: socialLinkSection,
  } = island

  return (
    <>
      <EntryHeader defaultLogo={logos?.defaultLogo} />
      <OpenTabbedHeader
        logos={logos}
        joinUs={joinUs}
        sections={sections}
        pageLinkSection={pageLinkSection}
        legalLinkSection={legalLinkSection}
        socialLinkSection={socialLinkSection}
      />
    </>
  )
}
