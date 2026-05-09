import type { Meta, StoryObj } from '@storybook/react';
import { BackToTop } from '../components/BackToTop';

const meta: Meta<typeof BackToTop> = {
  title: 'Components/BackToTop',
  component: BackToTop,
  decorators: [
    (Story) => (
      <div style={{ height: '200vh', background: '#0a0a0b', position: 'relative' }}>
        <p style={{ color: '#white', padding: '2rem' }}>Scroll down to see the button...</p>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof BackToTop>;

export const Scrolled: Story = {
  parameters: {
    docs: {
      description: {
        story: 'Visible when scrolling away from the top of the page.',
      },
    },
  },
};
