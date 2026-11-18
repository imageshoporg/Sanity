import {defineArrayMember, defineField, defineType, ObjectInputProps} from 'sanity'

import {ImageShopVideoInput} from '../components/ImageShopVideoInput'
import {ImageShopPluginConfig, ImageShopVideoValue} from '../types'

export const IMAGESHOP_VIDEO_TYPE_NAME = 'imageshop.video'

/**
 * Object type that stores a reference to a video in Imageshop (permalinks + metadata).
 * Nothing is uploaded to Sanity. Built per plugin instance so the input gets the plugin config.
 */
export const buildImageShopVideoType = (config: ImageShopPluginConfig) =>
  defineType({
    name: IMAGESHOP_VIDEO_TYPE_NAME,
    title: 'Imageshop video',
    type: 'object',
    fieldsets: [
      {
        name: 'imageshop',
        title: 'Imageshop source',
        options: {collapsible: true, collapsed: true},
      },
    ],
    fields: [
      defineField({name: 'title', title: 'Title', type: 'string'}),
      defineField({name: 'description', title: 'Description', type: 'text', rows: 3}),
      defineField({name: 'creditLine', title: 'Credit', type: 'string'}),
      defineField({
        name: 'documentId',
        title: 'Imageshop document ID',
        type: 'string',
        readOnly: true,
        fieldset: 'imageshop',
      }),
      defineField({
        name: 'code',
        title: 'Imageshop code',
        type: 'string',
        readOnly: true,
        fieldset: 'imageshop',
      }),
      defineField({
        name: 'url',
        title: 'Video URL',
        description: 'Highest-resolution rendition. Prefer `renditions` for <source> sets.',
        type: 'url',
        readOnly: true,
        fieldset: 'imageshop',
      }),
      defineField({
        name: 'renditions',
        title: 'Renditions',
        type: 'array',
        readOnly: true,
        fieldset: 'imageshop',
        of: [
          defineArrayMember({
            name: 'rendition',
            type: 'object',
            fields: [
              defineField({name: 'url', type: 'url'}),
              defineField({name: 'type', type: 'string'}),
              defineField({name: 'label', type: 'string'}),
            ],
            preview: {select: {title: 'label', subtitle: 'type'}},
          }),
        ],
      }),
      defineField({
        name: 'thumbnail',
        title: 'Poster image URL',
        type: 'url',
        fieldset: 'imageshop',
      }),
      defineField({
        name: 'aspectRatio',
        title: 'Aspect ratio',
        type: 'number',
        fieldset: 'imageshop',
      }),
    ],
    components: {
      input: (props: ObjectInputProps) => (
        <ImageShopVideoInput
          {...(props as ObjectInputProps<ImageShopVideoValue>)}
          imageShopConfig={config}
        />
      ),
    },
    preview: {
      select: {title: 'title', code: 'code', thumbnail: 'thumbnail'},
      prepare({title, code, thumbnail}: {title?: string; code?: string; thumbnail?: string}) {
        return {
          title: title || code || 'Imageshop video',
          subtitle: title && code ? code : 'Video',
          media: thumbnail ? (
            <img
              src={thumbnail}
              alt=""
              style={{objectFit: 'cover', width: '100%', height: '100%'}}
            />
          ) : undefined,
        }
      },
    },
  })
