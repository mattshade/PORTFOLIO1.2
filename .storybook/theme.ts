import { create } from 'storybook/theming';

export default create({
  base: 'dark',

  fontBase: '"Geist", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif',
  fontCode: '"Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',

  brandTitle: 'Matt Shade — Portfolio',
  brandUrl: 'https://www.mattshade.com/',
  brandImage: '/logo.svg',
  brandTarget: '_blank',

  appBg: '#0a0a0b',
  appContentBg: '#0a0a0b',
  appBorderColor: 'rgba(255, 255, 255, 0.08)',
  appBorderRadius: 8,

  textColor: '#f3f4f6',
  textInverseColor: '#0a0a0b',
  textMutedColor: '#9ca3af',

  barTextColor: '#9ca3af',
  barSelectedColor: '#bef264',
  barHoverColor: '#d9f99d',
  barBg: '#0f0f10',

  inputBg: '#111113',
  inputBorder: 'rgba(255, 255, 255, 0.12)',
  inputTextColor: '#f3f4f6',
  inputBorderRadius: 8,

  colorPrimary: '#bef264',
  colorSecondary: '#e2b35a',
});
