import type { Meta, StoryObj } from '@storybook/react';
import { SystemBoids } from '../components/SystemBoids';

const meta: Meta<typeof SystemBoids> = {
  title: 'Components/SystemBoids',
  component: SystemBoids,
  decorators: [
    (Story) => (
      <div style={{ height: '500px', background: '#0a0a0b', position: 'relative', overflow: 'hidden', border: '1px solid #27272a' }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    layout: 'fullscreen',
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SystemBoids>;

export const Default: Story = {};
