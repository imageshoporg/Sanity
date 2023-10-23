import {ImageShopPluginConfig} from '../types'
import {ExternalImageShopPluginConfig} from '../index'

export const getIframeParams = ({
  pluginConfig,
  isMulti,
  apiKey,
}: {
  pluginConfig: ImageShopPluginConfig
  isMulti?: boolean
  apiKey?: string
}) => {
  if (!apiKey) {
    return null
  }
  const iframeParams: any = {
    IFRAMEINSERT: 'true',
    HIDEIMAGEINFO: 'true',
    INSERTIMIDIATELY: 'true',
    SHOWSIZEDIALOGUE: 'true',
    SHOWCROPDIALOGUE: 'true',
    FREECROP: 'true',
    IMAGESHOPINTERFACENAME: pluginConfig.IMAGESHOPINTERFACENAME || '',
    IMAGESHOPDOCUMENTPREFIX: pluginConfig.IMAGESHOPDOCUMENTPREFIX || '',
    CULTURE: pluginConfig.CULTURE || 'nb-NO',
    PROFILEID: pluginConfig.PROFILEID || '',
    REQUIREDUPLOADFIELDS: pluginConfig.REQUIREDUPLOADFIELDS || '',
    UPLOADFIELDLANGUAGES: pluginConfig.UPLOADFIELDLANGUAGES || 'no,en',
    IMAGESHOPSIZES: `${pluginConfig.IMAGE_ALIAS || 'Large'};${
      pluginConfig.IMAGE_MAX_SIZE || '2048x2048'
    }`,
    FORMAT: 'json',
    IMAGESHOPTOKEN: apiKey,
  }

  if (isMulti) {
    iframeParams.ENABLEMULTISELECT = 'true'
  }

  return iframeParams
}
export const mapExternalConfigToInternal = (
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
