import type { Meta, StoryObj } from '@storybook/react'
import { Projects } from '../components/Projects'

const meta: Meta<typeof Projects> = {
  title: 'Components/Projects section',
  component: Projects,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Full “Case Studies and Projects” grid plus modal detail flow. Click a card to open the project detail overlay.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem 1.5rem 4rem', background: '#0a0a0b', minHeight: '100vh' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Projects>

export const Default: Story = {}
