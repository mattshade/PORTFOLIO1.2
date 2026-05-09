import type { Meta, StoryObj } from '@storybook/react';
import { SkillPop } from '../components/SkillPop';

const meta: Meta<typeof SkillPop> = {
  title: 'Components/SkillPop',
  component: SkillPop,
  decorators: [
    (Story) => (
      <div style={{ padding: '5rem', background: '#0a0a0b', height: '300px', position: 'relative' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof SkillPop>;

export const Default: Story = {
  args: {
    x: 150,
    y: 150,
    color: '#a3e635',
  },
};
