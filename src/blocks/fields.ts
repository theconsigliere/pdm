import type { Field } from 'payload'

export const blockMetadataFields: Field[] = [
  {
    name: 'blockTitle',
    type: 'text',
    required: true,
    admin: {
      description: 'Used for the block title data attribute.',
    },
  },
  {
    name: 'blockDescription',
    type: 'textarea',
    required: true,
    admin: {
      description: 'Used for the block description data attribute.',
    },
  },
]
