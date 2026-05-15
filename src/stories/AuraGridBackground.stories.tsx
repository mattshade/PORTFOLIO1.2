import type { Meta, StoryObj } from '@storybook/react'
import { AuraGridBackground } from '../components/AuraGridBackground'

const meta = {
  title: 'Architecture/Legacy — AuraGridBackground',
  component: AuraGridBackground,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          '**Legacy.** CSS grid + aura layer formerly stacked behind the home hero. Production now uses **Architecture → Origami aviary** as the single site-wide background.',
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
