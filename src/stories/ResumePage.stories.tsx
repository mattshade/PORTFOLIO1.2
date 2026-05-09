import type { Meta, StoryObj } from '@storybook/react'
import { Nav } from '../components/Nav'
import { Resume } from '../components/Resume'
import { Footer } from '../components/Footer'
import '../App.css'

const meta = {
  title: 'Pages/Resume',
  parameters: {
    layout: 'fullscreen' as const,
    docs: {
      description: {
        component:
          'Resume route shell: nav, resume document, footer—same structure as `ResumePage` without scroll/boids. Router context comes from the global Storybook preview decorator.',
      },
      story: {
        inline: true,
      },
    },
  },
  decorators: [
    (Story) => (
      <div className="app-content" style={{ background: '#0a0a0b', minHeight: '100vh' }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
} satisfies Meta

export default meta

type Story = StoryObj

export const WithNavAndFooter: Story = {
  render: () => (
    <>
      <Nav />
      <main id="main-content">
        <Resume />
      </main>
      <Footer />
    </>
  ),
}
