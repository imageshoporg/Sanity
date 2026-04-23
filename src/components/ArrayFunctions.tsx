import { ArraySchemaType } from 'sanity'
import { AddIcon } from '@sanity/icons'
import { useState } from 'react'
import { Button } from '@sanity/ui'
import { randomKey } from '@sanity/util/content'
import ImageShopAssetSource from './ImageShopAssetSource'
import { ArrayInputFunctionsProps, AssetFromSource, useClient } from 'sanity'
import { ImageAsset } from 'sanity'
import { ImageShopPluginConfig } from '../types'

// These are the props any implementation of the ArrayFunctions part will receive

/**
 * This function overrides the array-functions to also add a upload multiple images for the imageshop plugin.
 * @param props
 * @constructor
 */

type Props = ArrayInputFunctionsProps<{ _key: string }, ArraySchemaType> & {
  imageShopConfig: ImageShopPluginConfig
}

const ArrayFunctions = (props: Props) => {
  const { onItemAppend, imageShopConfig } = props
  const [isAssetSourceOpen, setIsAssetSourceOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const client = useClient({ apiVersion: '2023-08-08' })

  const handleAddMultipleBtnClick = () => {
    setIsAssetSourceOpen(true)
  }

  const onClose = () => {
    setIsAssetSourceOpen(false)
  }

  const onSelect = async (files: AssetFromSource[]) => {
    setIsLoading(true)

    const promises = files.map(async (file) => {
      let uploadFile: Blob | File | null = null

      if (file.kind === 'url' && typeof file.value === 'string') {
        const resp = await fetch(file.value)
        uploadFile = await resp.blob()
      } else if (file.kind === 'file' && file.value instanceof Blob) {
        uploadFile = file.value
      }

      if (!uploadFile) {
        return
      }

      const dataLookup: ImageAsset | any = file.assetDocumentProps || {}
      const fileNameFromValue =
        file.kind === 'file' && file.value instanceof File ? file.value.name : undefined

      // Upload image via sanity client.
      const imageAssetDocument = await client.assets.upload('image', uploadFile, {
        filename: file.assetDocumentProps?.originalFileName || fileNameFromValue,
        ...dataLookup,
      })

      // Create a random key for the array item.
      const _key = randomKey(12)

      // Create object based on sanity datastructure for an image.
      const theImage = {
        _type: 'image',
        _key,
        asset: {
          _type: 'reference',
          _ref: imageAssetDocument._id,
        },
      }

      onItemAppend(theImage)
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
            component: () => null
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
