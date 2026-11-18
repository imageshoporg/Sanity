import {
  ImageShopAsset,
  ImageShopPickerMode,
  ImageShopPluginConfig,
  ImageShopVideoRendition,
} from '../types'
import {ExternalImageShopPluginConfig} from '../index'

// Image-only parameters. In video mode IMAGESHOPSIZES turns the poster into a resized
// permalink that redirects to a 403, so video and document modes drop all of them.
const IMAGE_ONLY_PARAMS = [
  'SHOWSIZEDIALOGUE',
  'SHOWCROPDIALOGUE',
  'FREECROP',
  'IMAGESHOPSIZES',
  'PROFILEID',
]

export const getIframeParams = ({
  pluginConfig,
  isMulti,
  apiKey,
  mode = 'image',
}: {
  pluginConfig: ImageShopPluginConfig
  isMulti?: boolean
  apiKey?: string
  mode?: ImageShopPickerMode
}) => {
  if (!apiKey) {
    return null
  }
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
    IMAGESHOPSIZES: `${pluginConfig.IMAGE_ALIAS || 'Large'};${
      pluginConfig.IMAGE_MAX_SIZE || '2048x2048'
    }`,
    FORMAT: 'json',
    IMAGESHOPTOKEN: apiKey,
  }

  if (isMulti) {
    iframeParams.ENABLEMULTISELECT = 'true'
  }

  if (mode !== 'image') {
    for (const param of IMAGE_ONLY_PARAMS) {
      delete iframeParams[param]
    }
    if (mode === 'video') {
      iframeParams.SHOWVIDEO = 'true'
    } else {
      iframeParams.SHOWDOCUMENT = 'true'
    }
  }

  return iframeParams
}

export const resolveLanguage = (pluginConfig: ImageShopPluginConfig): string =>
  pluginConfig.languageResolver
    ? pluginConfig.languageResolver()
    : pluginConfig.SANITY_ASSET_TEXT_LANGUAGE || 'no'

/**
 * Title / description / credit resolution shared by images and videos.
 * Image output must stay identical, so keep this logic as it was in imageShopAssetToSanityAsset.
 */
export const resolveImageShopTexts = (
  imageShopData: ImageShopAsset,
  language: string,
  documentTitle?: string,
): {title?: string; description?: string; creditLine?: string} => {
  const textObject =
    imageShopData?.text?.[language] || ({} as Partial<ImageShopAsset['text'][string]>)
  const texts: {title?: string; description?: string; creditLine?: string} = {}

  if (documentTitle) {
    texts.title = documentTitle
  }
  if (textObject?.title) {
    texts.title = textObject.title
  }
  // alt text maps to description (internal sanity field)
  texts.description =
    textObject?.altText || textObject?.description || texts?.title || documentTitle

  if (textObject?.credits) {
    texts.creditLine = textObject.credits
  }
  return texts
}

/** True only if every `accept` token is a video MIME type (`video/*`, `video/mp4`, ...). */
export const isVideoOnlyAccept = (accept?: string): boolean => {
  const tokens = (accept || '')
    .split(',')
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
  return tokens.length > 0 && tokens.every((token) => token.startsWith('video/'))
}

/** Highest numeric label (`1080p` > `720p`); non-numeric labels rank last; ties keep order. */
export const pickVideoRendition = (
  videos?: ImageShopVideoRendition[],
): ImageShopVideoRendition | undefined => {
  if (!videos?.length) {
    return undefined
  }
  const rank = (video: ImageShopVideoRendition) => {
    const height = parseInt(video.label, 10)
    return Number.isFinite(height) ? height : -1
  }
  return videos.reduce((best, video) => (rank(video) > rank(best) ? video : best))
}

/** Imageshop sends `type: "mp4"`; `<source type>` wants a MIME type. */
export const renditionMimeType = (type?: string): string | undefined => {
  if (!type) {
    return undefined
  }
  return type.includes('/') ? type : `video/${type.toLowerCase()}`
}
export const mapExternalConfigToInternal = (
  external: ExternalImageShopPluginConfig,
): ImageShopPluginConfig => ({
  SANITY_ASSET_TEXT_LANGUAGE: external.sanityAssetTextLanguage,
  IMAGESHOPINTERFACENAME: external.imageShopInterfaceName,
  IMAGESHOPDOCUMENTPREFIX: external.imageShopDocumentPrefix,
  CULTURE: external.culture,
  PROFILEID: external.profileId,
  REQUIREDUPLOADFIELDS: external.requiredUploadFields,
  IMAGE_ALIAS: external.imageAlias,
  IMAGE_MAX_SIZE: external.imageMaxSize,
  languageResolver: external.languageResolver,
  fieldMapper: external.fieldMapper,
})
