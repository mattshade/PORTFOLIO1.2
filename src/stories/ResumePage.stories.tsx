import type { Meta, StoryObj } from '@storybook/react'
import { Nav } from '../components/Nav'
import { Resume } from '../components/Resume'
import { Footer } from '../components/Footer'
import { OrigamiAviaryBackground } from '../components/OrigamiAviaryBackground/OrigamiAviaryBackground'
import '../App.css'
import '../components/OrigamiAviaryBackground/OrigamiAviaryBackground.css'

const meta = {
  title: 'Pages/Resume',
  parameters: {
    layout: 'fullscreen' as const,
    docs: {
      description: {
        component:
          'Resume route shell: nav, resume document, footer. **Content only** uses a flat backdrop; **With aviary** matches production (`App.tsx` global background). Router context comes from the Storybook preview decorator.',
      },
      story: {
        inline: true,
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

const ResumeShell = () => (
  <>
    <Nav />
    <main id="main-content">
      <Resume />
    </main>
    <Footer />
  </>
)

export const ContentOnly: Story = {
  parameters: { withAviary: false },
  render: () => <ResumeShell />,
}

export const WithAviary: Story = {
  parameters: { withAviary: true },
  render: () => <ResumeShell />,
}
