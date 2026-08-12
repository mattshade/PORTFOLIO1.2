import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import { ContactPage } from '../pages/ContactPage'

describe('ContactPage', () => {
  it('redirects legacy /contact route to homepage anchor', () => {
    render(
      <MemoryRouter initialEntries={['/contact']}>
        <ContactPage />
      </MemoryRouter>,
    )
    expect(screen.queryByRole('form')).not.toBeInTheDocument()
  })
})
