import type { Meta, StoryObj } from '@storybook/react';
import { SayHiBubble } from '../components/SayHiBubble';
import '../components/Hero.css';
import '../App.css';

const meta: Meta<typeof SayHiBubble> = {
  title: 'Components/SayHiBubble',
  component: SayHiBubble,
  decorators: [
    (Story) => (
      <div style={{ padding: '5rem', background: '#0a0a0b', minHeight: '300px', display: 'flex', justifyContent: 'center' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SayHiBubble>;

export const Default: Story = {};
