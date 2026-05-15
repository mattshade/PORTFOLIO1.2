import type { Meta, StoryObj } from '@storybook/react'
import { OrigamiAviaryBackground } from '../components/OrigamiAviaryBackground/OrigamiAviaryBackground'
import '../components/OrigamiAviaryBackground/OrigamiAviaryBackground.css'

const meta = {
  title: 'Architecture/Origami aviary',
  component: OrigamiAviaryBackground,
  parameters: {
    layout: 'fullscreen' as const,
    docs: {
      description: {
        component:
          'Site-wide Three.js background: wireframe forest, flocking origami cranes, atmospheric particles, bloom, and a stalking cat. Mounted once in `App.tsx` behind `.app-content` (`aria-hidden`). Scroll drives perspective tilt (neutral at page top); pointer adds parallax. Respects `prefers-reduced-motion`.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div style={{ width: '100%', minHeight: '100vh', position: 'relative', overflow: 'hidden' }}>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OrigamiAviaryBackground>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}
