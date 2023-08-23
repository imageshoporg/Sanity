export type AssetDocument = {
  _id: string
  label?: string
  title?: string
  description?: string
  source?: {
    id: string
    name: string
    url?: string
  }
  creditLine?: string
  originalFilename?: string
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
      title: string
      description: string
      rights: string
      credits: string
      tags: string
      categories: string[]
    }
  }
}

export type ImageShopIFrameEventData = [string, string, number, number]
