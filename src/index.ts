import {
  ArrayOfObjectsInputProps,
  AssetSource,
  definePlugin,
  isArrayOfObjectsSchemaType,
} from 'sanity'
import ImageShop from './components/ImageShopAssetSource'
import Icon from './components/Icon'
import ArrayFunctions from './components/ArrayFunctions'
import {layoutResolver} from './layoutResolver'
import {FieldMapper, LanguageResolver} from './types'

/**
 * @public
 */
export const imageShopAssetSource: AssetSource = {
  name: 'imageshop',
  title: 'Imageshop',
  component: ImageShop,
  icon: Icon,
}

export interface ImageShopPluginConfig {
  SANITY_ASSET_TEXT_LANGUAGE?: string
  IMAGESHOPINTERFACENAME?: string
  IMAGESHOPDOCUMENTPREFIX?: string
  CULTURE?: string
  PROFILEID?: string
  REQUIREDUPLOADFIELDS?: string
  UPLOADFIELDLANGUAGES?: string
  IMAGESHOPTOKEN?: string
  IMAGE_ALIAS?: string
  IMAGE_MAX_SIZE?: string

  // custom hooks
  languageResolver?: LanguageResolver
  fieldMapper?: FieldMapper
}
/**
 * @public
 */
export const imageShopAsset = definePlugin<ImageShopPluginConfig>((config = {}) => {
  return {
    name: 'sanity-plugin-asset-source-imageshop',

    studio: {
      components: {
        layout: (props) => layoutResolver(props, config),
      },
    },
    form: {
      components: {
        input: (props) => {
          const {schemaType} = props
          if (isArrayOfObjectsSchemaType(schemaType)) {
            const arrayProps = props as ArrayOfObjectsInputProps
            // @ts-ignore
            const shouldDisplayMultiUpload = arrayProps.schemaType?.options?.batchUpload
            if (shouldDisplayMultiUpload) {
              return arrayProps.renderDefault({...arrayProps, arrayFunctions: ArrayFunctions})
            }
          }
          return props.renderDefault(props)
        },
      },
      image: {
        assetSources: (prev) => {
          return [...prev, imageShopAssetSource]
        },
      },
    },
  }
})
