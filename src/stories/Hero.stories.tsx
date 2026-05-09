import type { Meta, StoryObj } from '@storybook/react';
import { Hero } from '../components/Hero';

const meta: Meta<typeof Hero> = {
  title: 'Components/Hero',
  component: Hero,
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0a0b', minHeight: '100vh', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Hero>;

export const Default: Story = {};
