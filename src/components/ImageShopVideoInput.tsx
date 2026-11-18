import {useCallback, useState} from 'react'
import {Button, Card, Flex, Stack, Text} from '@sanity/ui'
import {TrashIcon} from '@sanity/icons'
import {ObjectInputProps, set, unset} from 'sanity'

import Icon from './Icon'
import {ImageShopPickerDialog} from './ImageShopPickerDialog'
import {
  ImageShopAsset,
  ImageShopPickResult,
  ImageShopPluginConfig,
  ImageShopVideoValue,
} from '../types'
import {
  pickVideoRendition,
  renditionMimeType,
  resolveImageShopTexts,
  resolveLanguage,
} from '../util/imageshopUtils'

type Props = ObjectInputProps<ImageShopVideoValue> & {
  imageShopConfig: ImageShopPluginConfig
}

const withoutUndefined = <T extends Record<string, unknown>>(obj: T): T =>
  Object.fromEntries(Object.entries(obj).filter(([, v]) => v !== undefined)) as T

export const imageShopAssetToVideoValue = (
  asset: ImageShopAsset,
  typeName: string,
  language: string,
): ImageShopVideoValue | null => {
  const main = pickVideoRendition(asset.videos)
  if (!main) {
    return null
  }
  const aspectRatio = asset.aspectratio ? parseFloat(asset.aspectratio) : NaN
  const {title, description, creditLine} = resolveImageShopTexts(asset, language)

  return withoutUndefined({
    _type: typeName as ImageShopVideoValue['_type'],
    documentId: asset.documentId === undefined ? undefined : String(asset.documentId),
    code: asset.code || undefined,
    url: main.file,
    renditions: (asset.videos || []).map((video, index) =>
      withoutUndefined({
        _key: `rendition-${index}`,
        url: video.file,
        type: video.type || undefined,
        label: video.label || undefined,
      }),
    ),
    thumbnail: asset.image?.file || undefined,
    aspectRatio: Number.isFinite(aspectRatio) ? aspectRatio : undefined,
    title: title || undefined,
    description: description || undefined,
    creditLine: creditLine || undefined,
  })
}

export const ImageShopVideoPlayer = ({value}: {value: ImageShopVideoValue}) => {
  const sources = value.renditions?.length
    ? value.renditions.map((r) => ({key: r._key, src: r.url, type: renditionMimeType(r.type)}))
    : value.url
      ? [{key: 'url', src: value.url, type: undefined}]
      : []

  if (!sources.length) {
    return null
  }

  return (
    // key forces a reload when the sources change (changing <source> children alone doesn't)
    <video
      key={sources.map((s) => s.src).join('|')}
      controls
      preload="metadata"
      poster={value.thumbnail}
      style={{width: '100%', display: 'block', background: 'black'}}
    >
      {sources.map((s) => (
        <source key={s.key} src={s.src} type={s.type} />
      ))}
    </video>
  )
}

export const ImageShopVideoInput = (props: Props) => {
  const {value, onChange, readOnly, schemaType, imageShopConfig} = props
  const [isPickerOpen, setPickerOpen] = useState(false)
  const hasVideo = !!(value?.url || value?.renditions?.length)

  const handlePick = useCallback(
    (result: ImageShopPickResult) => {
      if (result.kind !== 'assets' || !result.assets[0]) {
        return
      }
      const next = imageShopAssetToVideoValue(
        result.assets[0],
        schemaType.name,
        resolveLanguage(imageShopConfig),
      )
      if (next) {
        onChange(set(next))
      }
      setPickerOpen(false)
    },
    [imageShopConfig, onChange, schemaType.name],
  )

  return (
    <Stack space={3}>
      <Card border radius={2} padding={hasVideo ? 0 : 4} tone="transparent" overflow="hidden">
        {hasVideo && value ? (
          <ImageShopVideoPlayer value={value} />
        ) : (
          <Text size={1} muted align="center">
            No video selected
          </Text>
        )}
      </Card>
      <Flex gap={2}>
        <Button
          style={{flex: 1}}
          mode="ghost"
          icon={Icon}
          text={hasVideo ? 'Replace from Imageshop' : 'Select from Imageshop'}
          onClick={() => setPickerOpen(true)}
          disabled={readOnly}
        />
        {hasVideo && (
          <Button
            mode="ghost"
            tone="critical"
            icon={TrashIcon}
            text="Remove"
            onClick={() => onChange(unset())}
            disabled={readOnly}
          />
        )}
      </Flex>
      {hasVideo && props.renderDefault(props)}
      {isPickerOpen && (
        <ImageShopPickerDialog
          mode="video"
          imageShopConfig={imageShopConfig}
          onClose={() => setPickerOpen(false)}
          onPick={handlePick}
        />
      )}
    </Stack>
  )
}
