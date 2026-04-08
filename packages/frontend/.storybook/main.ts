import type { StorybookConfig } from '@storybook/react-vite'
import path from 'path'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-interactions', '@storybook/addon-links'],
  framework: { name: '@storybook/react-vite', options: {} },
  viteFinal: (config) => {
    config.resolve = config.resolve || {}
    config.resolve.alias = { ...config.resolve.alias, '@': path.resolve(__dirname, '../src') }
    config.css = { preprocessorOptions: { scss: { quietDeps: true } } }
    return config
  },
}

export default config
