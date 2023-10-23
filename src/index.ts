import {
  ArrayOfObjectsInputProps,
  AssetSource,
  definePlugin,
  isArrayOfObjectsSchemaType,
} from 'sanity'
import Icon from './components/Icon'
import {proveConfigForArrayFunctions, provideConfigAssetSource} from './componentResolver'
import {FieldMapper, LanguageResolver} from './types'
import {mapExternalConfigToInternal} from './util/imageshopUtils'

export const imageShopAssetSource: Partial<AssetSource> = {
  name: 'imageshop',
  title: 'Imageshop',
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

/**
 * @public
 */
export const imageShopAsset = definePlugin<ExternalImageShopPluginConfig>((config = {}) => {
  const mappedConfig = mapExternalConfigToInternal(config)
  return {
    name: 'sanity-plugin-asset-source-imageshop',

    form: {
      components: {
        input: (props) => {
          const {schemaType} = props
          if (isArrayOfObjectsSchemaType(schemaType)) {
            const arrayProps = props as ArrayOfObjectsInputProps
            // @ts-ignore
            const shouldDisplayMultiUpload = arrayProps.schemaType?.options?.batchUpload
            if (shouldDisplayMultiUpload) {
              return arrayProps.renderDefault({
                ...arrayProps,
                arrayFunctions: (arrayFunctionProps: any) =>
                  proveConfigForArrayFunctions({props: arrayFunctionProps, config: mappedConfig}),
              })
            }
          }
          return props.renderDefault(props)
        },
      },
      image: {
        assetSources: (prev) => {
          return [
            ...prev,
            {
              ...imageShopAssetSource,
              component: (props, context) => {
                return provideConfigAssetSource({props, config: mappedConfig})
              },
            },
          ]
        },
      },
    },
  }
})
