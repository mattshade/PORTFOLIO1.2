import type { Meta, StoryObj } from '@storybook/react';
import { Nav } from '../components/Nav';

const meta: Meta<typeof Nav> = {
  title: 'Components/Nav',
  component: Nav,
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0a0b', minHeight: '150px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Nav>;

export const Default: Story = {};
