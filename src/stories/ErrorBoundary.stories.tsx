import type { Meta, StoryObj } from '@storybook/react'
import { useState } from 'react'
import { ErrorBoundary } from '../components/ErrorBoundary'

function ThrowingChild({ shouldThrow }: { shouldThrow: boolean }) {
  if (shouldThrow) {
    throw new Error('Storybook demo: intentional render error')
  }
  return (
    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
      Child rendered successfully. Use the control or button to trigger the boundary.
    </p>
  )
}

function DemoHost() {
  const [shouldThrow, setShouldThrow] = useState(false)
  return (
    <div style={{ maxWidth: 420 }}>
      <button
        type="button"
        onClick={() => setShouldThrow(true)}
        style={{
          marginBottom: '1rem',
          padding: '0.5rem 1rem',
          borderRadius: 8,
          border: '1px solid var(--border-strong)',
          background: 'var(--bg-elevated)',
          color: 'var(--text)',
          cursor: 'pointer',
        }}
      >
        Trigger error
      </button>
      <ErrorBoundary
        fallback={
          <div
            role="alert"
            style={{
              padding: '1.25rem',
              borderRadius: 12,
              border: '1px solid var(--border-strong)',
              background: 'var(--bg-glass)',
              color: 'var(--text)',
            }}
          >
            <strong>Fallback UI</strong>
            <p style={{ margin: '0.5rem 0 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Error boundary caught a render failure (demo).
            </p>
          </div>
        }
      >
        <ThrowingChild shouldThrow={shouldThrow} />
      </ErrorBoundary>
    </div>
  )
}

const meta: Meta<typeof ErrorBoundary> = {
  title: 'Components/ErrorBoundary',
  component: ErrorBoundary,
  parameters: {
    docs: {
      description: {
        component:
          'Class boundary for unexpected render errors. Production fallback is minimal; stories use a richer fallback to document behavior.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div style={{ padding: '2rem', background: '#0a0a0b', minHeight: 240 }}>
        <Story />
      </div>
    ),
  ],
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DemoHost>

export const Default: Story = {
  render: () => <DemoHost />,
}
