import type { Block } from 'payload'
import { blockMetadataFields } from '@/blocks/fields'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

export const TextFeatureBlock: Block = {
  slug: 'textFeatureBlock',
  interfaceName: 'TextFeatureBlock',
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
      name: 'titles',
      type: 'array',
      maxRows: 3,
      fields: [
        {
          name: 'title',
          type: 'text',
        },
      ],
    },
    {
      name: 'images',
      type: 'array',
      maxRows: 5,
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
      ],
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
