export const CONTACT_FIELD_LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
} as const

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export type ContactFieldErrors = Partial<Record<'name' | 'email' | 'message', string>>

export function validateContactFields(values: {
  name: string
  email: string
  message: string
}): ContactFieldErrors {
  const errors: ContactFieldErrors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const message = values.message.trim()

  if (!name) {
    errors.name = 'Name is required.'
  } else if (name.length > CONTACT_FIELD_LIMITS.name) {
    errors.name = `Name must be ${CONTACT_FIELD_LIMITS.name} characters or fewer.`
  }

  if (!email) {
    errors.email = 'Email is required.'
  } else if (email.length > CONTACT_FIELD_LIMITS.email) {
    errors.email = `Email must be ${CONTACT_FIELD_LIMITS.email} characters or fewer.`
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!message) {
    errors.message = 'Message is required.'
  } else if (message.length > CONTACT_FIELD_LIMITS.message) {
    errors.message = `Message must be ${CONTACT_FIELD_LIMITS.message} characters or fewer.`
  }

  return errors
}
