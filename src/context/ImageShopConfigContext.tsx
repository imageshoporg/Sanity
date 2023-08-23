import React, {useContext} from 'react'
import {ImageShopPluginConfig} from '../index'

export const ImageShopConfigContext = React.createContext<ImageShopPluginConfig>({})

export const ImageShopConfigProvider = (props: {
  config: ImageShopPluginConfig
  children: React.ReactNode
}) => (
  <ImageShopConfigContext.Provider value={props.config}>
    {props.children}
  </ImageShopConfigContext.Provider>
)

export const useImageShopConfig = () => {
  const config = useContext(ImageShopConfigContext)
  return config
}
