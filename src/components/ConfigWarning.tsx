import {Button, Card, Stack, Text} from '@sanity/ui'

export const ConfigWarning = ({onOpenSettings}: {onOpenSettings: () => void}) => {
  return (
    <Card tone="caution" padding={4} radius={2}>
      <Stack space={4}>
        <Text as="h1" weight="semibold">
          Missing configuration
        </Text>
        <Text>You must first configure the plugin with your Imageshop credentials</Text>
        <Button onClick={() => onOpenSettings()}>Configure API-key</Button>
        <Text>
          You can get your credentials by visiting{' '}
          <a href="https://www.imageshop.no/" rel="noopener noreferrer" target="_blank">
            Imageshop
          </a>{' '}
          and get your token.
        </Text>
      </Stack>
    </Card>
  )
}
