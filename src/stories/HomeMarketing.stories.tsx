import type { Meta, StoryObj } from '@storybook/react'
import { Nav } from '../components/Nav'
import { Hero } from '../components/Hero'
import { Bio } from '../components/Bio'
import { OrigamiAviaryBackground } from '../components/OrigamiAviaryBackground/OrigamiAviaryBackground'
import '../App.css'
import '../components/OrigamiAviaryBackground/OrigamiAviaryBackground.css'

const meta = {
  title: 'Pages/Home (hero slice)',
  parameters: {
    layout: 'fullscreen' as const,
    docs: {
      description: {
        component:
          'Top-of-fold home composition: **Nav**, **Hero**, and **Bio** inside `.app-content`. Use **Content only** for fast typographic review; **With aviary** matches production (`App.tsx` mounts the global background behind content).',
      },
    },
  },
  decorators: [
    (Story, { parameters }) => {
      const withAviary = Boolean(parameters.withAviary)
      if (withAviary) {
        return (
          <>
            <OrigamiAviaryBackground />
            <div className="app-content" style={{ position: 'relative', zIndex: 2, minHeight: '100vh' }}>
              <Story />
            </div>
          </>
        )
      }
      return (
        <div className="app-content" style={{ background: '#0a0a0b', minHeight: '100vh' }}>
          <Story />
        </div>
      )
    },
  ],
  tags: ['autodocs'],
} satisfies Meta

export default meta

type Story = StoryObj

const HeroSlice = () => (
  <>
    <Nav />
    <main id="main-content">
      <Hero />
      <Bio />
    </main>
  </>
)

export const ContentOnly: Story = {
  parameters: { withAviary: false },
  render: () => <HeroSlice />,
}

export const WithAviary: Story = {
  parameters: {
    withAviary: true,
    docs: {
      description: {
        story: 'Production-like stack: global `OrigamiAviaryBackground` plus hero content. Scroll to preview perspective parallax.',
      },
    },
  },
  render: () => <HeroSlice />,
}
