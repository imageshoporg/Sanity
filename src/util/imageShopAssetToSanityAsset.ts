import {FieldMapper, ImageShopAsset} from '../types'
import {AssetFromSource, ImageAsset} from 'sanity'

export const imageShopAssetToSanityAsset = (
  imageShopData: ImageShopAsset,
  resolvedLanguage: string,
  fieldMapper?: FieldMapper,
  documentTitle?: string,
): AssetFromSource | null => {
  if (!imageShopData || !imageShopData.documentId) {
    return null
  }

  const textObject = imageShopData?.text[resolvedLanguage] || {}
  const assetDocumentProps: Partial<ImageAsset> = {
    _type: 'sanity.imageAsset',
    source: {
      id: imageShopData.documentId,
      name: `imageshop`,
    },
    texts: imageShopData.text,
  }

  if (documentTitle) {
    assetDocumentProps.title = documentTitle
  }
  if (textObject?.title) {
    assetDocumentProps.title = textObject.title
  }
  // alt text maps to description (internal sanity field)
  assetDocumentProps.description =
    textObject?.altText || textObject?.description || assetDocumentProps?.title || documentTitle

  if (textObject?.credits) {
    assetDocumentProps.creditLine = textObject.credits
  }

  const docProps: ImageAsset = fieldMapper
    ? (fieldMapper(assetDocumentProps, imageShopData) as ImageAsset)
    : (assetDocumentProps as ImageAsset)
  const asset: AssetFromSource = {
    kind: 'url',
    value: imageShopData.image.file,
    assetDocumentProps: docProps,
  }
  return asset
}
