import type { Form as FormType } from '@payloadcms/plugin-form-builder/types'
import type { DefaultTypedEditorState } from '@payloadcms/richtext-lexical'
import React from 'react'

import { FormBlock } from '@/blocks/Form/Component'
import { Button } from '@/components/Button'
import RichText from '@/components/RichText'

type ContactSectionBlockProps = {
  blockName?: string
  blockType?: 'contactSection'
  form: FormType
  contactInfo?:
    | {
        content?: DefaultTypedEditorState
        id?: string | null
      }[]
    | null
  buttons?:
    | {
        link: React.ComponentProps<typeof Button>
        id?: string | null
      }[]
    | null
}

export const ContactSectionBlock: React.FC<ContactSectionBlockProps> = ({
  form,
  contactInfo,
  buttons,
}) => {
  return (
    <section className="contactSection">
      <div className="contactSection__inner pd__container">
        <div className="contactSection__info">
          {contactInfo?.map((item, index) => {
            if (!item?.content) return null

            return (
              <div key={item.id ?? index} className="contactSection__item">
                <div className="contactSection__item-index mono">0{index + 1}</div>
                <div className="contactSection__item-text">
                  <RichText
                    className="contactSection__info-item"
                    data={item.content}
                    enableGutter={false}
                  />
                </div>
              </div>
            )
          })}

          {buttons && buttons.length > 0 && (
            <div className="contactSection__buttons">
              {buttons.map(({ link }, index) => (
                <Button
                  key={index}
                  className={`contactSection__button ${index === 0 ? 'btn--primary' : 'btn--outline'}`}
                  {...link}
                />
              ))}
            </div>
          )}
        </div>

        <div className="contactSection__form-section">
          <FormBlock enableIntro={false} form={form} />
        </div>
      </div>
    </section>
  )
}
