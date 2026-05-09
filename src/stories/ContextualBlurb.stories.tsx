import type { Meta, StoryObj } from '@storybook/react';
import { within, userEvent } from 'storybook/test';
import { ContextualBlurb } from '../components/ContextualBlurb';

const meta: Meta<typeof ContextualBlurb> = {
  title: 'Components/ContextualBlurb',
  component: ContextualBlurb,
  decorators: [
    (Story) => (
      <div style={{ padding: '5rem', background: '#0a0a0b', minHeight: '300px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof ContextualBlurb>;

export const Default: Story = {
  args: {
    id: 'story-blurb',
    text: "This is a technical system insight.",
    title: 'Interaction Lab',
  },
};

export const InteractionTest: Story = {
  args: {
    ...Default.args,
    text: "Click the 'Got it' button to test the dismissal interaction.",
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    // Wait for the blurb to be visible (it has a 1s delay by default)
    const dismissButton = await canvas.findByLabelText(/dismiss/i, {}, { timeout: 3000 });
    await userEvent.click(dismissButton);
  },
};
