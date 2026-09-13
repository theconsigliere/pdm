import { getCachedGlobal } from '@/utilities/getGlobals'
import Link from 'next/link'

import { Button } from '@/components/Button'
import { HeaderLogo } from './Logo'

export async function Header() {
  const headerData = await getCachedGlobal('header', 1)()

  return (
    <header className="pd__headered">
      <div className="pd__header-inner pd__mega-container">
        <Link className="pd__header-brand" href="/">
          <HeaderLogo logo={headerData.logo} />
        </Link>

        {headerData?.pageCTAButton && (
          <Button
            className="pd__header-cta btn--primary btn--primary--white"
            {...headerData.pageCTAButton}
          />
        )}
      </div>
    </header>
  )
}
