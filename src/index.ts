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

export interface ExternalImageShopPluginConfig {
  sanityAssetTextLanguage?: string
  imageShopInterfaceName?: string
  imageShopDocumentPrefix?: string
  culture?: string
  profileId?: string
  requiredUploadFields?: string
  uploadFieldLanguages?: string
  imageAlias?: string
  imageMaxSize?: string
  // custom hooks
  languageResolver?: LanguageResolver
  fieldMapper?: FieldMapper
}

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

const mapExternalConfigToInternal = (
  external: ExternalImageShopPluginConfig,
): ImageShopPluginConfig => ({
  SANITY_ASSET_TEXT_LANGUAGE: external.sanityAssetTextLanguage,
  IMAGESHOPINTERFACENAME: external.imageShopInterfaceName,
  IMAGESHOPDOCUMENTPREFIX: external.imageShopDocumentPrefix,
  CULTURE: external.culture,
  PROFILEID: external.profileId,
  REQUIREDUPLOADFIELDS: external.requiredUploadFields,
  IMAGE_ALIAS: external.imageAlias,
  IMAGE_MAX_SIZE: external.imageMaxSize,
  languageResolver: external.languageResolver,
  fieldMapper: external.fieldMapper,
})
/**
 * @public
 */
export const imageShopAsset = definePlugin<ExternalImageShopPluginConfig>((config = {}) => {
  const mappedConfig = mapExternalConfigToInternal(config)
  return {
    name: 'sanity-plugin-asset-source-imageshop',

    studio: {
      components: {
        layout: (props) => layoutResolver(props, mappedConfig),
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
