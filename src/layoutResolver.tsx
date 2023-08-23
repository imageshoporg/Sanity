import {ImageShopConfigProvider} from './context/ImageShopConfigContext'
import {LayoutProps} from 'sanity'
import {ImageShopPluginConfig} from './index'

export const layoutResolver = (props: LayoutProps, config: ImageShopPluginConfig) => (
  <ImageShopConfigProvider config={config}>{props.renderDefault(props)}</ImageShopConfigProvider>
)
