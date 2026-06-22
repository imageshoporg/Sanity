import {defineConfig} from '@sanity/pkg-utils'

export default defineConfig({
  dist: 'dist',
  tsconfig: 'tsconfig.dist.json',

  // Disable strict API extraction (TSDoc tag validation)
  extract: {
    enabled: false,
  },
})
