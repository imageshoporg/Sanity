import {Card, Stack, Text} from '@sanity/ui'

export const ConfigWarning = () => (
  <Card tone="caution" padding={4} radius={2}>
    <Stack space={4}>
      <Text as="h1" weight="semibold">
        Missing configuration
      </Text>
      <Text>You must first configure the plugin with your Imageshop credentials</Text>
      <Text>
        Edit the <code>sanity.config.ts/js</code> file in your Sanity Studio folder. And configure
        token like so:
        <pre>
          <code>
            {`import {imageShopAsset} from 'sanity-plugin-asset-source-imageshop';
...
imageShopAsset({IMAGESHOPTOKEN: "my-secret-token"})
...
`}
          </code>
        </pre>
      </Text>
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
