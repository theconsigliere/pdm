import type { Block } from 'payload'
import { blockMetadataFields } from '@/blocks/fields'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

export const BreakdownBlock: Block = {
  slug: 'breakdownBlock',
  interfaceName: 'BreakdownBlock',
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
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      filterOptions: {
        mimeType: {
          in: ['image/png', 'image/svg+xml'],
        },
      },
    },
    {
      name: 'title',
      type: 'text',
    },
    {
      name: 'description',
      type: 'textarea',
    },
    {
      type: 'collapsible',
      label: 'Button',
      admin: {
        initCollapsed: true,
      },
      fields: [
        link({
          appearances: false,
          overrides: {
            name: 'button',
          },
        }),
      ],
    },
    {
      name: 'breakdownContent',
      type: 'array',
      fields: [
        {
          name: 'breakdownItem',
          type: 'group',
          fields: [
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
            {
              name: 'title',
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
          ],
        },
      ],
    },
    {
      name: 'subHeadlineBottom',
      type: 'text',
    },
  ],
}
