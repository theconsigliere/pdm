import type { GlobalConfig } from 'payload'

import { link } from '@/fields/link'
import { linkGroup } from '@/fields/linkGroup'
import { revalidateFloatingDynamicIsland } from './hooks/revalidateFloatingDynamicIsland'

const svgOnly = {
  mimeType: {
    equals: 'image/svg+xml',
  },
}

export const FloatingDynamicIsland: GlobalConfig = {
  slug: 'floating-dynamic-island',
  label: 'Floating Dynamic Island',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'Settings',
          fields: [
            {
              name: 'logos',
              type: 'group',
              fields: [
                {
                  name: 'defaultLogo',
                  type: 'upload',
                  relationTo: 'media',
                  filterOptions: svgOnly,
                },
                {
                  name: 'extendedLogo',
                  type: 'upload',
                  relationTo: 'media',
                  filterOptions: svgOnly,
                },
                link({
                  appearances: false,
                  disableLabel: true,
                  overrides: {
                    name: 'logoLink',
                    label: 'Logo link',
                  },
                }),
              ],
            },
            {
              name: 'joinUs',
              label: 'Join us',
              type: 'group',
              admin: {
                description: 'Update button link that is visible when floating island is open.',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                },
                link({
                  appearances: false,
                  disableLabel: true,
                  overrides: {
                    name: 'link',
                    label: 'Link',
                  },
                }),
              ],
            },
          ],
        },
        {
          label: 'Information',
          fields: [
            {
              name: 'sections',
              type: 'group',
              admin: {
                description:
                  'Page sections are pulled through dynamically from the page blocks on the current page, to update go to selected page and edit block title & block description',
              },
              fields: [
                {
                  name: 'label',
                  type: 'text',
                },
              ],
            },
            {
              name: 'pl',
              label: 'Page Link Section',
              type: 'group',
              fields: [
                {
                  name: 'pageLinksLabel',
                  label: 'Page Link Label',
                  type: 'text',
                },
                linkGroup({
                  appearances: false,
                  overrides: {
                    name: 'pageLinks',
                    label: 'Page Links',
                    maxRows: 12,
                  },
                }),
              ],
            },
            {
              name: 'll',
              label: 'Legal Link Section',
              type: 'group',
              fields: [
                {
                  name: 'legalLinksLabel',
                  label: 'Legal Link Label',
                  type: 'text',
                },
                linkGroup({
                  appearances: false,
                  linkOptions: {
                    relationTo: 'legal-pages',
                  },
                  overrides: {
                    name: 'legalLinks',
                    label: 'Legal Links',
                    maxRows: 12,
                  },
                }),
              ],
            },
            {
              name: 'sl',
              label: 'Social Link Section',
              type: 'group',
              fields: [
                {
                  name: 'socialLinksLabel',
                  label: 'Social Link Label',
                  type: 'text',
                },
                linkGroup({
                  appearances: false,
                  overrides: {
                    name: 'socialLinks',
                    label: 'Social Links',
                    maxRows: 12,
                  },
                }),
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    afterChange: [revalidateFloatingDynamicIsland],
  },
}
