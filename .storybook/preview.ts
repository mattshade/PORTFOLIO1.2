import '../src/index.css';
import { createElement } from 'react';
import { MemoryRouter } from 'react-router-dom';
import type { Preview } from '@storybook/react-vite'
import theme from './theme';

export const parameters = {
  actions: { argTypesRegex: '^on[A-Z].*' },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/i,
    },
    expanded: true,
    sort: 'requiredFirst' as const,
  },
  docs: {
    theme,
  },
  viewport: {
    viewports: {
      mobile: {
        name: 'Mobile',
        styles: { width: '375px', height: '667px' },
      },
      tablet: {
        name: 'Tablet',
        styles: { width: '768px', height: '1024px' },
      },
      desktop: {
        name: 'Desktop',
        styles: { width: '1280px', height: '800px' },
      },
      ultrawide: {
        name: 'Ultrawide',
        styles: { width: '1920px', height: '1080px' },
      },
    },
    defaultViewport: 'desktop',
  },
  a11y: {
    test: 'todo' as const,
  },
  options: {
    storySort: {
      method: 'alphabetical' as const,
      order: [
        'Introduction',
        ['Welcome', 'Visual language'],
        'Foundations',
        ['Design Tokens', 'Typography', 'Motion', 'Layout & grid'],
        'Guides',
        ['Accessibility', 'Handoff & QA'],
        'Architecture',
        ['Origami aviary', 'Legacy — AuraGridBackground', 'Legacy — SystemBoids'],
        'Components',
        'Pages',
      ],
      locales: 'en-US',
    },
  },
};

/** All stories run inside a router so components using Link / useLocation work (Resume, Nav, etc.). */
const preview: Preview = {
  parameters,
  decorators: [
    (Story) =>
      createElement(MemoryRouter, { initialEntries: ['/'] }, createElement(Story)),
  ],
};

export default preview;
