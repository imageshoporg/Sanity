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
}

export type ImageShopIFrameEventData = [string, string, number, number]
export type FieldMapper = (sanityAssetDocumentProps: any, imageShopData: ImageShopAsset) => any
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
