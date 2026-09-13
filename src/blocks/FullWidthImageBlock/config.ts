import type { Block } from 'payload'
import { blockMetadataFields } from '@/blocks/fields'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { link } from '@/fields/link'

export const FullWidthImageBlock: Block = {
  slug: 'fullWidthImageBlock',
  interfaceName: 'FullWidthImageBlock',
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
      name: 'content',
      type: 'richText',
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            HeadingFeature({ enabledHeadingSizes: ['h1', 'h2', 'h3', 'h4'] }),
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ]
        },
      }),
    },
    {
      name: 'inputForm',
      type: 'relationship',
      relationTo: 'forms',
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
    {
      name: 'embedCode',
      type: 'textarea',
      label: 'Embed Field',
      admin: {
        description: 'Paste external 3rd party contact or email form embed code.',
      },
    },
    {
      name: 'backgroundMedia',
      type: 'upload',
      relationTo: 'media',
    },
  ],
}
