import type { Meta, StoryObj } from '@storybook/react'
import { AuraGridBackground } from '../components/AuraGridBackground'

const meta = {
  title: 'Architecture/AuraGridBackground',
  component: AuraGridBackground,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'A modern, hardware-accelerated animated background combining a 3D perspective grid with fluid glowing mesh-gradient auras. Designed to complement the Dark Architectural design system and visually anchor the system flock.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof AuraGridBackground>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
