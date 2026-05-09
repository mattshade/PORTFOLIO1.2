import type { Meta, StoryObj } from '@storybook/react';
import { Experience } from '../components/Experience';

const meta: Meta<typeof Experience> = {
  title: 'Components/Experience',
  component: Experience,
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
type Story = StoryObj<typeof Experience>;

export const Default: Story = {};
