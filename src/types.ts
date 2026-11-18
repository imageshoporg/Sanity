import {ImageAsset} from 'sanity'

export type ImageShopVideoRendition = {
  file: string
  type: string
  label: string
}

export type ImageShopAsset = {
  documentId: string
  code: string
  extraInfo: null | string
  AuthorName: null | string
  image: {
    file: string
    width: number
    height: number
    thumbnail: string
  }
  text: {
    [k: string]: {
      altText: string
      title: string
      description: string
      rights: string
      credits: string
      tags: string
      categories: string[]
    }
  }
  InterfaceList: Array<{
    InterfaceID: number
    InterfaceName: string
  }>
  profile: any
  // video only (SHOWVIDEO=true)
  videos?: ImageShopVideoRendition[]
  aspectratio?: string
  subTitles?: unknown[]
}

export type ImageShopPickerMode = 'image' | 'video' | 'document'

/**
 * Parsed picker message.
 * Image and video modes send JSON (`assets`); document mode sends a plain download URL.
 */
export type ImageShopPickResult =
  | {kind: 'assets'; assets: ImageShopAsset[]; title?: string}
  | {kind: 'document'; url: string}

/**
 * Value stored by the `imageshop.video` schema type.
 * @public
 */
export type ImageShopVideoValue = {
  _type: 'imageshop.video'
  documentId?: string
  code?: string
  url?: string
  renditions?: Array<{_key: string; url: string; type?: string; label?: string}>
  thumbnail?: string
  aspectRatio?: number
  title?: string
  description?: string
  creditLine?: string
}

export type ImageShopIFrameEventData = [string, string, number, number]
export type FieldMapper = (
  sanityAssetDocumentProps: Partial<ImageAsset>,
  imageShopData: ImageShopAsset,
) => Partial<ImageAsset>
export type LanguageResolver = () => string

export interface ImageShopPluginConfig {
  SANITY_ASSET_TEXT_LANGUAGE?: string
  IMAGESHOPINTERFACENAME?: string
  IMAGESHOPDOCUMENTPREFIX?: string
  CULTURE?: string
  PROFILEID?: string
  REQUIREDUPLOADFIELDS?: string
  UPLOADFIELDLANGUAGES?: string
  IMAGE_ALIAS?: string
  IMAGE_MAX_SIZE?: string

  // custom hooks
  languageResolver?: LanguageResolver
  fieldMapper?: FieldMapper
}
