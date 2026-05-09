import { addons } from 'storybook/manager-api';
import theme from './theme';

addons.setConfig({
  theme,
  sidebar: {
    showRoots: true,
    collapsedRoots: [],
  },
  enableShortcuts: true,
  initialActive: 'sidebar',
});
