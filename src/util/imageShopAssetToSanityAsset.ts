import {FieldMapper, ImageShopAsset} from '../types'
import {AssetFromSource, FileAsset, ImageAsset} from 'sanity'

// AssetFromSource.assetDocumentProps is typed as ImageAsset, but Sanity only reads
// originalFilename/label/title/description/creditLine/source from it, for files too.
const asAssetDocumentProps = (props: Partial<FileAsset>) => props as unknown as ImageAsset
import {pickVideoRendition, resolveImageShopTexts} from './imageshopUtils'

export const imageShopAssetToSanityAsset = (
  imageShopData: ImageShopAsset,
  resolvedLanguage: string,
  fieldMapper?: FieldMapper,
  documentTitle?: string,
): AssetFromSource | null => {
  if (!imageShopData || !imageShopData.documentId) {
    return null
  }

  const assetDocumentProps: Partial<ImageAsset> = {
    _type: 'sanity.imageAsset',
    source: {
      id: imageShopData.documentId,
      name: `imageshop`,
    },
    texts: imageShopData.text,
    ...resolveImageShopTexts(imageShopData, resolvedLanguage, documentTitle),
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

// Picker download URLs look like /download/<slug>-<SubDocumentID>.<subdocument code>
const DOCUMENT_URL_PATTERN = /^\/download\/(.+)-(\d+)\.([A-Za-z0-9]+)$/

const safeDecode = (value: string) => {
  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

/**
 * Document mode: the picker only sends a download URL (no metadata), so the file is copied
 * into Sanity with a file name derived from the URL.
 */
export const imageShopDocumentUrlToSanityAsset = (url: string): AssetFromSource => {
  let originalFilename: string
  let sourceId = url

  const parsed = new URL(url)
  const match = DOCUMENT_URL_PATTERN.exec(parsed.pathname)
  if (match) {
    const [, slug, subDocumentId, extension] = match
    originalFilename = `${safeDecode(slug)}.${extension.toLowerCase()}`
    sourceId = subDocumentId
  } else {
    const lastSegment = parsed.pathname.split('/').filter(Boolean).pop()
    originalFilename = lastSegment ? safeDecode(lastSegment) : 'imageshop-document'
  }

  const assetDocumentProps = asAssetDocumentProps({
    _type: 'sanity.fileAsset',
    originalFilename,
    source: {id: sourceId, name: 'imageshop', url},
  })

  return {kind: 'url', value: url, assetDocumentProps}
}

/**
 * Video in a `file` field: copy one rendition (the highest resolution) into Sanity,
 * with Imageshop texts. The picker's `;undefined` tail is never used as a title.
 */
export const imageShopVideoToSanityFileAsset = (
  imageShopData: ImageShopAsset,
  resolvedLanguage: string,
): AssetFromSource | null => {
  const rendition = pickVideoRendition(imageShopData?.videos)
  if (!rendition) {
    return null
  }

  const baseName = imageShopData.code || String(imageShopData.documentId)
  const assetDocumentProps = asAssetDocumentProps({
    _type: 'sanity.fileAsset',
    originalFilename: `${baseName}.${(rendition.type || 'mp4').toLowerCase()}`,
    source: {id: String(imageShopData.documentId), name: 'imageshop', url: rendition.file},
    ...resolveImageShopTexts(imageShopData, resolvedLanguage),
  })

  return {kind: 'url', value: rendition.file, assetDocumentProps}
}
