import type { GlobalAfterChangeHook } from 'payload'

import { revalidateTag } from 'next/cache'

export const revalidateFloatingDynamicIsland: GlobalAfterChangeHook = ({
  doc,
  req: { payload, context },
}) => {
  if (!context.disableRevalidate) {
    payload.logger.info('Revalidating floating dynamic island')

    revalidateTag('global_floating-dynamic-island', 'max')
  }

  return doc
}
