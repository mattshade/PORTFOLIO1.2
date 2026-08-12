import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AboutTextBody } from './aboutTextRender'

describe('AboutTextBody', () => {
  it('renders portrait, tags, and prose blocks', () => {
    render(<AboutTextBody />)
    expect(screen.getByText('Matt Shade')).toBeInTheDocument()
    expect(screen.getByRole('list', { name: 'Focus areas' })).toBeInTheDocument()
    expect(screen.getByText(/designer, engineer, and creative technologist/i)).toBeInTheDocument()
    expect(screen.getByText(/disciplines/i)).toBeInTheDocument()
  })
})
