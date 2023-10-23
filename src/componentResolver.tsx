import {ArrayInputFunctionsProps, ArraySchemaType} from 'sanity'

import {ImageShopPluginConfig} from './types'
import {AssetSourceComponentProps} from 'sanity'
import ImageShopAssetSource from './components/ImageShopAssetSource'
import ArrayFunctions from './components/ArrayFunctions'

export const provideConfigAssetSource = ({
  props,
  config,
}: {
  props: AssetSourceComponentProps
  config: ImageShopPluginConfig
}) => {
  return <ImageShopAssetSource {...props} imageShopConfig={config} />
}

export const proveConfigForArrayFunctions = ({
  props,
  config,
}: {
  props: ArrayInputFunctionsProps<{_key: string}, ArraySchemaType>
  config: ImageShopPluginConfig
}) => {
  return <ArrayFunctions {...props} imageShopConfig={config} />
}
