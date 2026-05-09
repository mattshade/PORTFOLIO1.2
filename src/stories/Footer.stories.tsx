import type { Meta, StoryObj } from '@storybook/react';
import { Footer } from '../components/Footer';

const meta: Meta<typeof Footer> = {
  title: 'Components/Footer',
  component: Footer,
  decorators: [
    (Story) => (
      <div style={{ background: '#0a0a0b' }}>
        <div style={{ height: '50vh' }}>Content Spacer</div>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Footer>;

export const Default: Story = {};
