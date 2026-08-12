import type { Meta, StoryObj } from '@storybook/react'
import { ContactSection } from '../components/ContactSection'
import '../App.css'

const meta: Meta<typeof ContactSection> = {
  title: 'Components/ContactSection',
  component: ContactSection,
  decorators: [
    (Story) => (
      <div style={{ padding: '3rem 1.5rem', background: '#0a0a0b', minHeight: '480px' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof ContactSection>

export const Default: Story = {}
