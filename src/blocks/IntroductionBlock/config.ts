import type { Block } from 'payload'
import { blockMetadataFields } from '@/blocks/fields'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

export const IntroductionBlock: Block = {
  slug: 'introductionBlock',
  interfaceName: 'IntroductionBlock',
  fields: [
    ...blockMetadataFields,
    {
      name: 'blockId',
      type: 'text',
      label: 'ID',
      required: true,
    },
    {
      name: 'subHeadline',
      type: 'text',
    },
    {
      name: 'trainingContent',
      type: 'array',
      fields: [
        {
          name: 'trainingItem',
          type: 'group',
          fields: [
            {
              name: 'subHeadline',
              type: 'text',
            },
            {
              name: 'content',
              type: 'richText',
              editor: lexicalEditor({
                features: ({ rootFeatures }) => {
                  return [
                    ...rootFeatures,
                    HeadingFeature({ enabledHeadingSizes: ['h2', 'h3', 'h4'] }),
                    FixedToolbarFeature(),
                    InlineToolbarFeature(),
                  ]
                },
              }),
            },
            {
              name: 'image',
              type: 'upload',
              relationTo: 'media',
              filterOptions: {
                mimeType: {
                  contains: 'image',
                },
              },
            },
          ],
        },
      ],
    },
    {
      type: 'collapsible',
      label: 'Button',
      admin: {
        initCollapsed: true,
      },
      fields: [
        link({
          overrides: {
            name: 'button',
          },
        }),
      ],
    },
  ],
}
