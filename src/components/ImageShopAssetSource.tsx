import {AssetFromSource, AssetSourceComponentProps} from 'sanity'

import {ImageShopPickerMode, ImageShopPickResult, ImageShopPluginConfig} from '../types'
import {
  imageShopAssetToSanityAsset,
  imageShopDocumentUrlToSanityAsset,
  imageShopVideoToSanityFileAsset,
} from '../util/imageShopAssetToSanityAsset'
import {isVideoOnlyAccept, resolveLanguage} from '../util/imageshopUtils'
import {ImageShopPickerDialog} from './ImageShopPickerDialog'

type Props = AssetSourceComponentProps & {
  isMultiUploadType?: boolean
  isLoadingMultiUpload?: boolean
  imageShopConfig: ImageShopPluginConfig
}

const resolveMode = (props: Props): ImageShopPickerMode => {
  if (props.assetType === 'file') {
    return isVideoOnlyAccept(props.accept) ? 'video' : 'document'
  }
  // image fields, and ArrayFunctions (which passes no assetType)
  return 'image'
}

const ImageShopAssetSource = (props: Props) => {
  const {isLoadingMultiUpload, isMultiUploadType, imageShopConfig: pluginConfig} = props
  const mode = resolveMode(props)

  const handlePick = (result: ImageShopPickResult) => {
    if (result.kind === 'document') {
      props.onSelect([imageShopDocumentUrlToSanityAsset(result.url)])
      return
    }

    const resolvedLanguage = resolveLanguage(pluginConfig)
    const selectedFiles = result.assets
      .map((imageShopData) =>
        mode === 'video'
          ? imageShopVideoToSanityFileAsset(imageShopData, resolvedLanguage)
          : imageShopAssetToSanityAsset(
              imageShopData,
              resolvedLanguage,
              pluginConfig.fieldMapper,
              result.title,
            ),
      )
      .filter((asset) => asset !== null) as AssetFromSource[]

    props.onSelect(selectedFiles)
  }

  return (
    <ImageShopPickerDialog
      mode={mode}
      isMulti={isMultiUploadType}
      isLoadingMultiUpload={isLoadingMultiUpload}
      imageShopConfig={pluginConfig}
      onClose={props.onClose}
      onPick={handlePick}
    />
  )
}

export default ImageShopAssetSource
