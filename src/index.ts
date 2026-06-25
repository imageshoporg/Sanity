import {
  definePlugin,
  isArrayOfObjectsInputProps,
  AssetSource,
  AssetSourceComponentProps,
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
  // studio behaviour
  exclusiveAssetSource?: boolean
  disableDirectUploads?: boolean
}

export function buildImageShopAssetSource(config: ExternalImageShopPluginConfig): AssetSource {
  return {
    ...imageShopAssetSource,
    component: (props: AssetSourceComponentProps) => {
      return provideConfigAssetSource({props, config: mapExternalConfigToInternal(config)})
    },
  } as AssetSource
}
/**
 * @public
 */
export const imageShopAsset = definePlugin<ExternalImageShopPluginConfig>((internalConfig = {}) => {
  return {
    name: 'sanity-plugin-asset-source-imageshop',

    form: {
      components: {
        input: (props) => {
          if (isArrayOfObjectsInputProps(props)) {
            // @ts-ignore — batchUpload is a custom option not in official schema types
            const shouldDisplayMultiUpload = props.schemaType?.options?.batchUpload
            if (shouldDisplayMultiUpload) {
              return props.renderDefault({
                ...props,
                arrayFunctions: (arrayFunctionProps: any) =>
                  proveConfigForArrayFunctions({
                    props: arrayFunctionProps,
                    config: mapExternalConfigToInternal(internalConfig),
                  }),
              })
            }
          }
          return props.renderDefault(props)
        },
      },
      image: {
        assetSources: (prev) => {
          const imageshopSource = buildImageShopAssetSource(internalConfig)
          return internalConfig.exclusiveAssetSource
            ? [imageshopSource]
            : [...prev, imageshopSource]
        },
        directUploads: internalConfig.disableDirectUploads ? false : undefined,
      },
    },
  }
})
