import type { Meta, StoryObj } from '@storybook/react'
import { Resume } from '../components/Resume'

const meta: Meta<typeof Resume> = {
  title: 'Components/Resume',
  component: Resume,
  parameters: {
    docs: {
      description: {
        component:
          'Print-style resume body. Uses `Link` from react-router-dom for “Back”. Router context comes from the global Storybook preview decorator.',
      },
      story: {
        inline: true,
      },
    },
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '3rem', background: '#0a0a0b', minHeight: '100vh' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Resume>

export const Default: Story = {}
