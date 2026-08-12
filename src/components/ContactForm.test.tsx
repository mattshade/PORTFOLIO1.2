import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ContactForm } from './ContactForm'

vi.mock('../data/resume', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../data/resume')>()
  return {
    ...actual,
    resume: {
      ...actual.resume,
      contactFormEndpoint: '',
    },
  }
})

describe('ContactForm', () => {
  it('shows validation errors on empty submit', () => {
    render(<ContactForm />)
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect(screen.getByText('Name is required.')).toBeInTheDocument()
    expect(screen.getByText('Email is required.')).toBeInTheDocument()
    expect(screen.getByText('Message is required.')).toBeInTheDocument()
  })

  it('uses mailto fallback on localhost after valid submit', () => {
    const originalHostname = window.location.hostname
    Object.defineProperty(window, 'location', {
      value: { ...window.location, hostname: 'localhost', href: '' },
      configurable: true,
    })

    render(<ContactForm />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Matt' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'hi@example.com' } })
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    expect(window.location.href).toContain('mailto:')
    Object.defineProperty(window, 'location', {
      value: { ...window.location, hostname: originalHostname },
      configurable: true,
    })
  })

  it('submits through Netlify on production host', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    Object.defineProperty(window, 'location', {
      value: { ...window.location, hostname: 'www.mattshade.com', href: 'https://www.mattshade.com/' },
      configurable: true,
    })

    render(<ContactForm />)
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Matt' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'hi@example.com' } })
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('/', expect.objectContaining({ method: 'POST' }))
    })
    expect(await screen.findByText(/Thanks!/)).toBeInTheDocument()
    vi.unstubAllGlobals()
  })

  it('ignores honeypot submissions', () => {
    render(<ContactForm />)
    fireEvent.change(screen.getByLabelText('Leave this empty'), { target: { value: 'bot' } })
    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Matt' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'hi@example.com' } })
    fireEvent.change(screen.getByLabelText('Message'), { target: { value: 'Hello' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send message' }))
    expect(screen.queryByText(/Thanks!/)).not.toBeInTheDocument()
  })
})
