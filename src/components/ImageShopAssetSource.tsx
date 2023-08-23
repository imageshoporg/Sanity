import {useEffect, useRef, useState} from 'react'
import {Dialog, Spinner, Stack, Flex, Text, Box} from '@sanity/ui'

import {ImageShopAsset, ImageShopIFrameEventData} from '../types'
import {IFrame} from './ImageShopAssetSource.styled'
import {imageShopAssetToSanityAsset} from '../util/imageShopAssetToSanityAsset'
import {IMAGESHOP_CLIENT, IMAGESHOP_INSERT_IMAGE_API} from '../constants/constants'
import {AssetFromSource, AssetSourceComponentProps} from 'sanity'
import {ConfigWarning} from './ConfigWarning'
import {useImageShopConfig} from '../context/ImageShopConfigContext'
import defaultLanguageResolver from '../languageResolver'

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
  const hasConfig = !!pluginConfig.IMAGESHOPTOKEN
  const [loadingMessage, setLoadingMessage] = useState<string | null>(
    'Loading ImageShop Media Libary',
  )
  const contentRef = useRef<HTMLDivElement>(null)
  const domId = useRef(Date.now())
  const isMulti = isMultiUploadType
  const languageResolver = pluginConfig.languageResolver
    ? pluginConfig.languageResolver
    : () => defaultLanguageResolver(pluginConfig)

  const handleClose = () => {
    props.onClose()
  }

  const handleEvent = (event: any) => {
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

    if (Array.isArray(parsedEventData)) {
      if (!event.data) {
        return
      }
      const imageShopDatas = parsedEventData as ImageShopAsset[]
      if (!imageShopDatas || !Array.isArray(imageShopDatas) || imageShopDatas.length === 0) {
        return
      }
      const assetsToBeUploaded = imageShopDatas
        .map((imageShopObject) => imageShopAssetToSanityAsset(imageShopObject, languageResolver))
        .filter((asset) => asset !== null) as AssetFromSource[]

      if (assetsToBeUploaded) {
        selectedFiles = assetsToBeUploaded
      }
    } else {
      const imageShopData = parsedEventData as ImageShopAsset
      // console.log(imageShopData)
      const uploadAsset = imageShopAssetToSanityAsset(imageShopData, languageResolver, title)
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

  const iframeParams: any = {
    IFRAMEINSERT: 'true',
    HIDEIMAGEINFO: 'true',
    INSERTIMIDIATELY: 'true',
    SHOWSIZEDIALOGUE: 'true',
    SHOWCROPDIALOGUE: 'true',
    FREECROP: 'true',
    IMAGESHOPINTERFACENAME: pluginConfig.IMAGESHOPINTERFACENAME || '',
    IMAGESHOPDOCUMENTPREFIX: pluginConfig.IMAGESHOPDOCUMENTPREFIX || '',
    CULTURE: pluginConfig.CULTURE || 'nb-NO',
    PROFILEID: pluginConfig.PROFILEID || '',
    REQUIREDUPLOADFIELDS: pluginConfig.REQUIREDUPLOADFIELDS || '',
    UPLOADFIELDLANGUAGES: pluginConfig.UPLOADFIELDLANGUAGES || 'no,en',
    IMAGESHOPTOKEN: pluginConfig.IMAGESHOPTOKEN,
    IMAGESHOPSIZES: `${pluginConfig.IMAGE_ALIAS || 'Large'};${
      pluginConfig.IMAGE_MAX_SIZE || '2048x2048'
    }`,
    FORMAT: 'json',
  }

  if (isMulti) {
    iframeParams.ENABLEMULTISELECT = 'true'
  }

  const url = `${IMAGESHOP_INSERT_IMAGE_API}?${new URLSearchParams(iframeParams)}`

  return (
    <Dialog
      id="imageshop-asset-source"
      title="Select image from ImageShop"
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
        {hasConfig && (
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
        {!hasConfig && <ConfigWarning />}
      </Box>
    </Dialog>
  )
}

export default function ImageShopAssetSource(props: Props) {
  return <ImageShopAssetSourceInternal {...props} />
}
