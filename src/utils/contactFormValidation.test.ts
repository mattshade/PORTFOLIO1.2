import { describe, expect, it } from 'vitest'
import { CONTACT_FIELD_LIMITS, validateContactFields } from './contactFormValidation'

describe('validateContactFields', () => {
  it('requires all fields', () => {
    expect(validateContactFields({ name: '', email: '', message: '' })).toEqual({
      name: 'Name is required.',
      email: 'Email is required.',
      message: 'Message is required.',
    })
  })

  it('validates email format', () => {
    expect(validateContactFields({ name: 'Matt', email: 'not-an-email', message: 'Hi' })).toEqual({
      email: 'Enter a valid email address.',
    })
  })

  it('accepts trimmed valid input', () => {
    expect(
      validateContactFields({ name: '  Matt  ', email: '  hi@example.com ', message: ' Hello ' }),
    ).toEqual({})
  })

  it('enforces max lengths', () => {
    const longName = 'x'.repeat(CONTACT_FIELD_LIMITS.name + 1)
    expect(validateContactFields({ name: longName, email: 'a@b.co', message: 'Hi' }).name).toMatch(
      /characters or fewer/,
    )
    const longEmail = `${'a'.repeat(CONTACT_FIELD_LIMITS.email - 4)}@b.co`
    expect(validateContactFields({ name: 'Matt', email: longEmail, message: 'Hi' }).email).toMatch(
      /characters or fewer/,
    )
    const longMessage = 'x'.repeat(CONTACT_FIELD_LIMITS.message + 1)
    expect(validateContactFields({ name: 'Matt', email: 'a@b.co', message: longMessage }).message).toMatch(
      /characters or fewer/,
    )
  })
})
