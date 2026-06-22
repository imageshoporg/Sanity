import {
  ArrayInputFunctionsProps,
  ArraySchemaType,
  useClient,
  AssetFromSource,
  ImageAsset,
} from 'sanity'
import {AddIcon} from '@sanity/icons'
import {useState} from 'react'
import {Button} from '@sanity/ui'
import ImageShopAssetSource from './ImageShopAssetSource'
import {ImageShopPluginConfig} from '../types'

type Props = ArrayInputFunctionsProps<{_key: string}, ArraySchemaType> & {
  imageShopConfig: ImageShopPluginConfig
}

const ArrayFunctions = (props: Props) => {
  const {onItemAppend, imageShopConfig} = props
  const [isAssetSourceOpen, setIsAssetSourceOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const client = useClient({apiVersion: '2023-08-08'})

  const handleAddMultipleBtnClick = () => {
    setIsAssetSourceOpen(true)
  }

  const onClose = () => {
    setIsAssetSourceOpen(false)
  }

  const onSelect = async (files: AssetFromSource[]) => {
    setIsLoading(true)

    const promises = files.map(async (file) => {
      if (typeof file.value === 'string' && file.kind === 'url') {
        const resp = await fetch(file.value)
        const blob = await resp.blob()

        const dataLookup: ImageAsset | any = file.assetDocumentProps || {}

        const imageAssetDocument = await client.assets.upload('image', blob, {
          filename: file.assetDocumentProps?.originalFilename,
          ...dataLookup,
        })

        const _key = crypto.randomUUID().replace(/-/g, '').substring(0, 12)

        const theImage = {
          _type: 'image',
          _key,
          asset: {
            _type: 'reference',
            _ref: imageAssetDocument._id,
          },
        }

        onItemAppend(theImage)
      }
    })

    await Promise.all(promises)

    setIsLoading(false)

    setIsAssetSourceOpen(false)
  }

  return (
    <div>
      <Button
        icon={AddIcon}
        mode="ghost"
        onClick={handleAddMultipleBtnClick}
        text="Add multiple images"
      />
      {isAssetSourceOpen && (
        <ImageShopAssetSource
          assetSource={{
            name: 'imageshop',
            title: 'ImageShop',
            component: () => null,
          }}
          imageShopConfig={imageShopConfig}
          isLoadingMultiUpload={isLoading}
          selectedAssets={[]}
          onClose={onClose}
          onSelect={onSelect}
          isMultiUploadType
          selectionType="single"
          accept="image/*"
        />
      )}
    </div>
  )
}

export default ArrayFunctions
