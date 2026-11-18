import {useEffect, useRef, useState} from 'react'
import {Dialog, Spinner, Stack, Flex, Text, Box, Button} from '@sanity/ui'
import {CogIcon} from '@sanity/icons'
import {useSecrets} from '@sanity/studio-secrets'

import {
  ImageShopAsset,
  ImageShopIFrameEventData,
  ImageShopPickerMode,
  ImageShopPickResult,
  ImageShopPluginConfig,
} from '../types'
import {IFrame} from './ImageShopAssetSource.styled'
import {IMAGESHOP_CLIENT, IMAGESHOP_INSERT_IMAGE_API} from '../constants/constants'
import {ConfigWarning} from './ConfigWarning'
import {getIframeParams} from '../util/imageshopUtils'
import SecretsConfigView, {namespace, Secrets} from './SecretsConfigView'

export type ImageShopPickerDialogProps = {
  mode: ImageShopPickerMode
  isMulti?: boolean
  isLoadingMultiUpload?: boolean
  imageShopConfig: ImageShopPluginConfig
  onClose: () => void
  onPick: (result: ImageShopPickResult) => void
}

const LOADING_TEXT: Record<ImageShopPickerMode, string> = {
  image: 'Loading Imageshop Media Library',
  video: 'Loading Imageshop videos',
  document: 'Loading Imageshop documents',
}

/**
 * Parses a picker `postMessage` payload. Returns null for messages that should be ignored.
 * - image: `"<json>;<title>;…"` — unchanged from earlier plugin versions.
 * - video: `"<json>;undefined;undefined;undefined"` — the tail is never a title.
 * - document: `"<downloadUrl>;;0;0;document"` — no JSON, no metadata.
 */
export const parsePickerMessage = (
  data: string,
  mode: ImageShopPickerMode,
): ImageShopPickResult | null => {
  if (mode === 'document') {
    const [urlString] = data.split(';')
    try {
      const url = new URL(urlString)
      return url.protocol === 'https:' ? {kind: 'document', url: url.href} : null
    } catch {
      return null
    }
  }

  const [imageShopDataString, title] = data.split(';') as ImageShopIFrameEventData
  if (!imageShopDataString) {
    return null
  }

  const parsedEventData = JSON.parse(imageShopDataString)

  if (Array.isArray(parsedEventData)) {
    const assets = parsedEventData as ImageShopAsset[]
    return assets.length ? {kind: 'assets', assets} : null
  }

  return {
    kind: 'assets',
    assets: [parsedEventData as ImageShopAsset],
    title: mode === 'image' ? title : undefined,
  }
}

export const ImageShopPickerDialog = (props: ImageShopPickerDialogProps) => {
  const {mode, isMulti, isLoadingMultiUpload, imageShopConfig: pluginConfig, onClose} = props
  const {secrets} = useSecrets<Secrets>(namespace)
  const hasConfig = !!secrets?.apiKey
  const [showSettings, setShowSettings] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)
  const domId = useRef(Date.now())

  // The listener is registered once; read the latest callback/mode through refs.
  const onPickRef = useRef(props.onPick)
  onPickRef.current = props.onPick
  const modeRef = useRef(mode)
  modeRef.current = mode

  useEffect(() => {
    const handleEvent = (event: MessageEvent) => {
      if (!event || !event.data || typeof event.data !== 'string') {
        return
      }
      if (event.origin !== IMAGESHOP_CLIENT) {
        return
      }
      let result: ImageShopPickResult | null
      try {
        result = parsePickerMessage(event.data, modeRef.current)
      } catch (error) {
        console.error('[imageshop] Could not parse picker message', error)
        return
      }
      if (result) {
        onPickRef.current(result)
      }
    }

    window.addEventListener('message', handleEvent)
    return () => {
      window.removeEventListener('message', handleEvent)
    }
  }, [])

  const iframeParams = getIframeParams({pluginConfig, isMulti, apiKey: secrets?.apiKey, mode})

  const url = iframeParams
    ? `${IMAGESHOP_INSERT_IMAGE_API}?${new URLSearchParams(iframeParams)}`
    : null

  return (
    <Dialog
      id="imageshop-asset-source"
      header={
        <Button
          fontSize={[1]}
          icon={CogIcon}
          onClick={() => setShowSettings(true)}
          mode="bleed"
          aria-label="Imageshop settings"
        />
      }
      onClose={onClose}
      width={hasConfig ? 4 : 1}
      zOffset={9999}
    >
      {' '}
      <Box padding={4}>
        {isLoadingMultiUpload && (
          <Stack space={3}>
            <Flex align="center" justify="center">
              <Spinner muted />
            </Flex>
            <Text size={1} muted align="center">
              Uploading images, please wait.
            </Text>
          </Stack>
        )}
        {hasConfig && isLoading && (
          <Stack space={3}>
            <Flex align="center" justify="center">
              <Spinner muted />
            </Flex>
            <Text size={1} muted align="center">
              {LOADING_TEXT[mode]}
            </Text>
          </Stack>
        )}
        {hasConfig && !!url && (
          <div ref={contentRef} id={`imageshopWidget-${domId.current}`}>
            <IFrame
              onLoad={() => {
                setIsLoading(false)
              }}
              frameBorder={0}
              width="100%"
              src={url}
            />
          </div>
        )}
        {!hasConfig && <ConfigWarning onOpenSettings={() => setShowSettings(true)} />}
      </Box>
      {showSettings && <SecretsConfigView onClose={() => setShowSettings(false)} />}
    </Dialog>
  )
}
