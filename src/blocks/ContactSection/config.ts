import type { Block } from 'payload'
import { blockMetadataFields } from '@/blocks/fields'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'

import { linkGroup } from '@/fields/linkGroup'

export const ContactSectionBlock: Block = {
  slug: 'contactSection',
  interfaceName: 'ContactSectionBlock',
  fields: [
    ...blockMetadataFields,
    {
      name: 'blockId',
      type: 'text',
      label: 'ID',
      required: true,
    },
    {
      name: 'contactInfo',
      type: 'array',
      label: 'Contact Info',
      admin: {
        initCollapsed: true,
      },
      fields: [
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
    {
      name: 'form',
      type: 'relationship',
      relationTo: 'forms',
      required: true,
    },
    linkGroup({
      appearances: false,
      overrides: {
        name: 'buttons',
        label: 'Buttons',
        maxRows: 2,
      },
    }),
  ],
}
