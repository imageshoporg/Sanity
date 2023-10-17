import {SettingsView} from '@sanity/studio-secrets'

export type Secrets = {
  apiKey: string
}

const pluginConfigKeys = [
  {
    key: 'apiKey',
    title: 'API key',
    description: '',
  },
]

export const namespace = 'imageShop'

type Props = {
  onClose: () => void
}

const SecretsConfigView = (props: Props) => {
  return (
    <SettingsView
      title="Imageshop config"
      namespace={namespace}
      keys={pluginConfigKeys}
      onClose={props.onClose}
    />
  )
}

export default SecretsConfigView
