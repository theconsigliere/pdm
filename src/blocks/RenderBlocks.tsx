import React, { Fragment } from 'react'

import type { Page } from '@/payload-types'

import { ArchiveBlock } from '@/blocks/ArchiveBlock/Component'
import { BreakdownBlock } from '@/blocks/BreakdownBlock/Component'
import { CallToActionBlock } from '@/blocks/CallToAction/Component'
import { ContactSectionBlock } from '@/blocks/ContactSection'
import { ContentBlock } from '@/blocks/Content/Component'
import { FAQBlock } from '@/blocks/FAQBlock/Component'
import { FormBlock } from '@/blocks/Form/Component'
import { FullWidthImageBlock } from '@/blocks/FullWidthImageBlock/Component'
import { IntroductionBlock } from '@/blocks/IntroductionBlock/Component'
import { MediaBlock } from '@/blocks/MediaBlock/Component'
import { SignupBlock } from '@/blocks/SignupBlock/Component'
import { TextFeatureBlock } from '@/blocks/TextFeatureBlock/Component'

const blockComponents = {
  archive: ArchiveBlock,
  breakdownBlock: BreakdownBlock,
  content: ContentBlock,
  contactSection: ContactSectionBlock,
  cta: CallToActionBlock,
  faqBlock: FAQBlock,
  formBlock: FormBlock,
  fullWidthImageBlock: FullWidthImageBlock,
  introductionBlock: IntroductionBlock,
  mediaBlock: MediaBlock,
  signupBlock: SignupBlock,
  textFeatureBlock: TextFeatureBlock,
}

export const RenderBlocks: React.FC<{
  blocks: Page['layout'][0][]
}> = (props) => {
  const { blocks } = props

  const hasBlocks = blocks && Array.isArray(blocks) && blocks.length > 0

  if (hasBlocks) {
    return (
      <Fragment>
        {blocks.map((block, index) => {
          const { blockType } = block
          const blockId = (block as any).blockId

          if (blockType && blockType in blockComponents) {
            const Block = blockComponents[blockType]

            if (Block) {
              return (
                <section
                  className=""
                  data-block={block.blockName}
                  data-block-title={block.blockTitle || undefined}
                  data-block-description={block.blockDescription || undefined}
                  id={blockId}
                  key={index}
                >
                  {/* @ts-expect-error there may be some mismatch between the expected types here */}
                  <Block {...block} disableInnerContainer />
                </section>
              )
            }
          }
          return null
        })}
      </Fragment>
    )
  }

  return null
}
