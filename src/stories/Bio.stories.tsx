import type { Meta, StoryObj } from '@storybook/react';
import { Bio } from '../components/Bio';

const meta: Meta<typeof Bio> = {
  title: 'Components/Bio',
  component: Bio,
  decorators: [
    (Story) => (
      <div style={{ padding: '3rem', background: '#0a0a0b', minHeight: '100vh' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Bio>;

export const Default: Story = {};
