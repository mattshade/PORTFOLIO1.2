import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ContactSection } from './ContactSection'

describe('ContactSection', () => {
  it('renders contact heading and form', () => {
    render(<ContactSection />)
    expect(screen.getByRole('heading', { name: 'Contact' })).toBeInTheDocument()
    expect(screen.getByLabelText('Name')).toBeInTheDocument()
    expect(screen.getByLabelText('Email')).toBeInTheDocument()
    expect(screen.getByLabelText('Message')).toBeInTheDocument()
    expect(document.getElementById('contact')).toBeInTheDocument()
  })
})
