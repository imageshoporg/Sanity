import {useEffect, useRef, useState} from 'react'
import {Dialog, Spinner, Stack, Flex, Text, Box, Button} from '@sanity/ui'

import {ImageShopAsset, ImageShopIFrameEventData} from '../types'
import {IFrame} from './ImageShopAssetSource.styled'
import {imageShopAssetToSanityAsset} from '../util/imageShopAssetToSanityAsset'
import {IMAGESHOP_CLIENT, IMAGESHOP_INSERT_IMAGE_API} from '../constants/constants'
import {AssetFromSource, AssetSourceComponentProps} from 'sanity'
import {ConfigWarning} from './ConfigWarning'
import {useImageShopConfig} from '../context/ImageShopConfigContext'
import {getIframeParams} from '../util/imageshopUtils'
import {useSecrets} from '@sanity/studio-secrets'
import SecretsConfigView, {namespace, Secrets} from './SecretsConfigView'
import {CogIcon} from '@sanity/icons'

declare global {
  // eslint-disable-next-line no-unused-vars
  interface Window {
    imageshop: any
  }
}

window.imageshop = window.imageshop || {}

type Props = AssetSourceComponentProps & {
  isMultiUploadType?: boolean
  isLoadingMultiUpload?: boolean
}

const ImageShopAssetSourceInternal = (props: Props) => {
  const {isLoadingMultiUpload, isMultiUploadType} = props
  const pluginConfig = useImageShopConfig()
  const {secrets} = useSecrets<Secrets>(namespace)
  const hasConfig = !!secrets?.apiKey
  const [showSettings, setShowSettings] = useState(false)

  const [loadingMessage, setLoadingMessage] = useState<string | null>(
    'Loading Imageshop Media Libary',
  )
  const contentRef = useRef<HTMLDivElement>(null)
  const domId = useRef(Date.now())
  const isMulti = isMultiUploadType
  const languageResolver = pluginConfig.languageResolver

  const fieldMapper = pluginConfig.fieldMapper

  const handleClose = () => {
    props.onClose()
  }

  const handleEvent = (event: MessageEvent) => {
    if (!event || !event.data) {
      return
    }
    if (typeof event.data !== 'string') {
      return
    }
    if (event.origin !== IMAGESHOP_CLIENT) {
      return
    }

    let selectedFiles: AssetFromSource[] = []

    const [imageShopDataString, title] = event.data.split(';') as ImageShopIFrameEventData

    if (!imageShopDataString) {
      return
    }

    const parsedEventData = JSON.parse(imageShopDataString)

    const resolvedLanguage = languageResolver
      ? languageResolver()
      : pluginConfig.SANITY_ASSET_TEXT_LANGUAGE || 'no'

    if (Array.isArray(parsedEventData)) {
      if (!event.data) {
        return
      }
      const imageShopDatas = parsedEventData as ImageShopAsset[]
      if (!imageShopDatas || !Array.isArray(imageShopDatas) || imageShopDatas.length === 0) {
        return
      }

      const assetsToBeUploaded = imageShopDatas
        .map((imageShopData) =>
          imageShopAssetToSanityAsset(imageShopData, resolvedLanguage, fieldMapper),
        )
        .filter((asset) => asset !== null) as AssetFromSource[]

      if (assetsToBeUploaded) {
        selectedFiles = assetsToBeUploaded
      }
    } else {
      const imageShopData = parsedEventData as ImageShopAsset
      const uploadAsset = imageShopAssetToSanityAsset(
        imageShopData,
        resolvedLanguage,
        fieldMapper,
        title,
      )
      if (uploadAsset) {
        selectedFiles = [uploadAsset]
      }
    }

    props.onSelect(selectedFiles)
  }

  useEffect(() => {
    window.addEventListener('message', handleEvent)

    return () => {
      window.removeEventListener('message', handleEvent)
    }
  }, [])

  const iframeParams = getIframeParams({pluginConfig, isMulti, apiKey: secrets?.apiKey})

  const url = iframeParams
    ? `${IMAGESHOP_INSERT_IMAGE_API}?${new URLSearchParams(iframeParams)}`
    : null

  return (
    <Dialog
      id="imageshop-asset-source"
      title="Select image from Imageshop"
      header={
        <Button
          fontSize={[1]}
          icon={CogIcon}
          onClick={() => setShowSettings(true)}
          mode="bleed"
          aria-label="Imageshop settings"
        />
      }
      onClose={handleClose}
      open
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
        {hasConfig && loadingMessage && (
          <Stack space={3}>
            <Flex align="center" justify="center">
              <Spinner muted />
            </Flex>
            <Text size={1} muted align="center">
              {loadingMessage}
            </Text>
          </Stack>
        )}
        {hasConfig && !!url && (
          <div ref={contentRef} id={`imageshopWidget-${domId}`}>
            <IFrame
              onLoad={() => {
                setLoadingMessage(null)
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

export default function ImageShopAssetSource(props: Props) {
  return <ImageShopAssetSourceInternal {...props} />
}
