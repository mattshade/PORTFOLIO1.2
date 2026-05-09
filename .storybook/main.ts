import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  /** Serve `public/` assets at / so project thumbnails, modal heroes, and resume PDF links resolve */
  staticDirs: ['../public'],
  docs: {
    autodocs: 'tag',
    defaultName: 'Documentation',
  },
  typescript: {
    reactDocgen: 'react-docgen-typescript',
    reactDocgenTypescriptOptions: {
      shouldExtractLiteralValuesFromEnum: true,
      shouldRemoveUndefinedFromOptional: true,
    },
  },
  "addons": [
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-a11y",
    "@storybook/addon-onboarding",
    "@storybook/addon-docs"
  ],
  "framework": "@storybook/react-vite",
  async viteFinal(config) {
    // Single copy of react-router + React so <Link> uses the same module instance as MemoryRouter (avoids "must be used within a Router" when Vite pre-bundles duplicates).
    config.resolve = config.resolve ?? {};
    config.resolve.dedupe = [
      ...(config.resolve.dedupe ?? []),
      'react',
      'react-dom',
      'react-router',
      'react-router-dom',
    ];
    // Deployed at https://www.mattshade.com/storybook/ — absolute base so chunk URLs are /storybook/assets/... (fixes blank/broken UI when the URL is /storybook?path=...). Set via package.json `build-storybook` so it also applies when Netlify runs `npm run build` (lifecycle is `build`, not `build-storybook`).
    const basePath = process.env.STORYBOOK_BASE_PATH?.trim();
    if (basePath) {
      config.base = basePath.endsWith('/') ? basePath : `${basePath}/`;
    }
    return config;
  },
};
export default config;