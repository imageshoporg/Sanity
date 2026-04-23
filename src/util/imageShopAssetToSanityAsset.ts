import {FieldMapper, ImageShopAsset} from '../types'
import {AssetFromSource} from 'sanity'

type AssetDocumentPropsInput = {
  imageShopData: ImageShopAsset
  resolvedLanguage: string
  fieldMapper?: FieldMapper
  documentTitle?: string
}

const createAssetDocumentProps = ({
  imageShopData,
  resolvedLanguage,
  fieldMapper,
  documentTitle,
}: AssetDocumentPropsInput): any => {
  const textObject = imageShopData?.text[resolvedLanguage] || {}
  const assetDocumentProps: any = {
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
  if (textObject?.description) {
    assetDocumentProps.description = textObject.description
  }
  if (textObject?.credits) {
    assetDocumentProps.creditLine = textObject.credits
  }

  return fieldMapper ? fieldMapper(assetDocumentProps, imageShopData) : assetDocumentProps
}

const extractFileName = (url: string) => {
  try {
    const parsed = new URL(url)
    const pathname = parsed.pathname || ''
    const lastSegment = pathname.split('/').filter(Boolean).pop()
    if (lastSegment) {
      return decodeURIComponent(lastSegment)
    }
  } catch {
    // No-op. We will fallback to document id.
  }
  return null
}

const blobToFile = (blob: Blob, fileName: string): File => {
  if (typeof File === 'undefined') {
    throw new Error('File constructor is unavailable in this environment.')
  }
  return new File([blob], fileName, {type: blob.type || 'application/octet-stream'})
}

const fetchBlobWithRetry = async (url: string, attempts = 3, timeoutMs = 25000) => {
  let lastError: unknown = null

  for (let attempt = 1; attempt <= attempts; attempt++) {
    const controller = new AbortController()
    const timeout = setTimeout(() => {
      controller.abort()
    }, timeoutMs)

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store',
      })
      if (!response.ok) {
        throw new Error(`Failed to fetch image. HTTP ${response.status}`)
      }

      const blob = await response.blob()
      if (!blob || blob.size === 0) {
        throw new Error('Fetched image is empty.')
      }

      return blob
    } catch (err) {
      lastError = err
      if (attempt < attempts) {
        await new Promise((resolve) => setTimeout(resolve, attempt * 350))
      }
    } finally {
      clearTimeout(timeout)
    }
  }

  throw lastError
}

export const imageShopAssetToSanityAsset = (
  imageShopData: ImageShopAsset,
  resolvedLanguage: string,
  fieldMapper?: FieldMapper,
  documentTitle?: string,
): AssetFromSource | null => {
  // Make a check, is this even from imageshop ? Should have .documentId and parsed the first part as json.
  if (!imageShopData || !imageShopData.documentId) {
    return null
  }

  const assetDocumentProps = createAssetDocumentProps({
    imageShopData,
    resolvedLanguage,
    fieldMapper,
    documentTitle,
  })

  const asset: AssetFromSource = {
    kind: 'url',
    value: imageShopData.image.file,
    assetDocumentProps,
  }
  return asset
}

export const imageShopAssetToSanityFileAsset = async (
  imageShopData: ImageShopAsset,
  resolvedLanguage: string,
  fieldMapper?: FieldMapper,
  documentTitle?: string,
): Promise<AssetFromSource | null> => {
  if (!imageShopData || !imageShopData.documentId || !imageShopData.image?.file) {
    return null
  }

  const blob = await fetchBlobWithRetry(imageShopData.image.file)
  const fileName = extractFileName(imageShopData.image.file) || `${imageShopData.documentId}.jpg`
  const file = blobToFile(blob, fileName)

  const assetDocumentProps = createAssetDocumentProps({
    imageShopData,
    resolvedLanguage,
    fieldMapper,
    documentTitle,
  })

  const fileValue = file as unknown as AssetFromSource['value']

  return {
    kind: 'file',
    value: fileValue,
    assetDocumentProps,
  }
}
