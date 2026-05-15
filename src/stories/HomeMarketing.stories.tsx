import type { Meta, StoryObj } from '@storybook/react'
import { Nav } from '../components/Nav'
import { Hero } from '../components/Hero'
import { Bio } from '../components/Bio'
import '../App.css'

/**
 * Top-of-fold slice of the home page: fixed nav + hero + bio — without the site-wide Three background or lower sections.
 * Use for marketing / typographic review without canvas/CSS animation cost.
 */
const meta = {
  title: 'Pages/Home (hero slice)',
  parameters: {
    layout: 'fullscreen' as const,
    docs: {
      description: {
        component:
          'Composition of **Nav**, **Hero**, and **Bio** inside `.app-content`. Matches production structure above the fold (Storybook omits the global `OrigamiPerspectiveBackground` from `App.tsx` and sections below Bio).',
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

export const Default: Story = {
  render: () => (
    <>
      <Nav />
      <main id="main-content">
        <Hero />
        <Bio />
      </main>
    </>
  ),
}
