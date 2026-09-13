import type { Block } from 'payload'
import { blockMetadataFields } from '@/blocks/fields'

import {
  FixedToolbarFeature,
  HeadingFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from '@payloadcms/richtext-lexical'
import { link } from '@/fields/link'

export const SignupBlock: Block = {
  slug: 'signupBlock',
  interfaceName: 'SignupBlock',
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
      name: 'inputType',
      type: 'radio',
      defaultValue: 'image',
      options: [
        {
          label: 'Image',
          value: 'image',
        },
        {
          label: 'Pre-built Form',
          value: 'form',
        },
      ],
    },
    {
      name: 'inputImage',
      type: 'upload',
      relationTo: 'media',
      admin: {
        condition: (_, siblingData) => siblingData?.inputType === 'image',
      },
      filterOptions: {
        mimeType: {
          contains: 'image',
        },
      },
    },
    {
      name: 'inputForm',
      type: 'relationship',
      relationTo: 'forms',
      admin: {
        condition: (_, siblingData) => siblingData?.inputType === 'form',
      },
    },
  ],
}
