import {ArraySchemaType} from 'sanity'
import {AddIcon} from '@sanity/icons'
import {useState} from 'react'
import {Button} from '@sanity/ui'
import {randomKey} from '@sanity/util/content'
import ImageShopAssetSource from './ImageShopAssetSource'
import {ArrayInputFunctionsProps, AssetFromSource, useClient} from 'sanity'
import {ImageAsset} from 'sanity'
import {ImageShopPluginConfig} from '../types'

// These are the props any implementation of the ArrayFunctions part will receive

/**
 * This function overrides the array-functions to also add a upload multiple images for the imageshop plugin.
 * @param props
 * @constructor
 */

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

    // We support only kind url.

    const promises = files.map(async (file) => {
      if (typeof file.value === 'string' && file.kind === 'url') {
        // Convert url to to blob
        const resp = await fetch(file.value)
        const blob = await resp.blob()

        const dataLookup: ImageAsset | any = file.assetDocumentProps || {}

        // Upload image via sanity client.
        const imageAssetDocument = await client.assets.upload('image', blob, {
          filename: file.assetDocumentProps?.originalFileName,
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
