import { useState, useEffect, useLayoutEffect, useCallback, FormEvent } from 'react'
import { createPortal } from 'react-dom'
import { resume } from '../data/resume'
import './SayHiBubble.css'

const FIELD_LIMITS = {
  name: 100,
  email: 254,
  message: 5000,
} as const

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

type FieldErrors = Partial<Record<'name' | 'email' | 'message', string>>

function validateContactFields(values: { name: string; email: string; message: string }): FieldErrors {
  const errors: FieldErrors = {}
  const name = values.name.trim()
  const email = values.email.trim()
  const message = values.message.trim()

  if (!name) {
    errors.name = 'Name is required.'
  } else if (name.length > FIELD_LIMITS.name) {
    errors.name = `Name must be ${FIELD_LIMITS.name} characters or fewer.`
  }

  if (!email) {
    errors.email = 'Email is required.'
  } else if (email.length > FIELD_LIMITS.email) {
    errors.email = `Email must be ${FIELD_LIMITS.email} characters or fewer.`
  } else if (!EMAIL_PATTERN.test(email)) {
    errors.email = 'Enter a valid email address.'
  }

  if (!message) {
    errors.message = 'Message is required.'
  } else if (message.length > FIELD_LIMITS.message) {
    errors.message = `Message must be ${FIELD_LIMITS.message} characters or fewer.`
  }

  return errors
}

export function SayHiBubble({ isNavLink = false, standalone = false }: { isNavLink?: boolean, standalone?: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const hasFormspree = !!resume.contactFormEndpoint
  const useNetlify = !hasFormspree && typeof window !== 'undefined' && window.location.hostname !== 'localhost'

  // Only the app-level instance listens for Nav / global open; Hero has its own trigger
  // so we never stack two modals (which required two clicks to dismiss).
  useEffect(() => {
    if (!standalone) return
    const handleTrigger = () => setIsOpen(true)
    window.addEventListener('open-contact', handleTrigger)
    return () => window.removeEventListener('open-contact', handleTrigger)
  }, [standalone])

  const handleClose = useCallback(() => {
    setIsOpen(false)
    setStatus('idle')
    setFieldErrors({})
  }, [])

  useLayoutEffect(() => {
    if (!isOpen) return
    document.body.classList.add('contact-open')
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => {
      document.body.classList.remove('contact-open')
      window.removeEventListener('keydown', handleEsc)
    }
  }, [isOpen, handleClose])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

    // Honeypot: bots fill hidden fields; real users leave them empty
    if ((data.get('bot-field') as string)?.trim()) {
      return
    }

    const name = ((data.get('name') as string) || '').trim()
    const email = ((data.get('email') as string) || '').trim()
    const message = ((data.get('message') as string) || '').trim()

    const errors = validateContactFields({ name, email, message })
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }
    setFieldErrors({})

    if (hasFormspree) {
      data.set('name', name)
      data.set('email', email)
      data.set('message', message)
      data.set('_subject', `Portfolio message from ${name}`)
      data.set('_replyto', email)
      setStatus('submitting')
      try {
        const res = await fetch(resume.contactFormEndpoint, {
          method: 'POST',
          body: data,
          headers: { Accept: 'application/json' },
        })
        if (res.ok) {
          setStatus('success')
          form.reset()
        } else {
          setStatus('error')
        }
      } catch {
        setStatus('error')
      }
    } else if (useNetlify) {
      setStatus('submitting')
      // Netlify Forms: form-name routes to the form, bot-field is honeypot (keep empty)
      const payload = new URLSearchParams({
        'form-name': resume.contactFormName,
        name,
        email,
        message,
        'bot-field': '',
      })
      try {
        const res = await fetch('/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: payload,
          credentials: 'same-origin',
        })
        if (res.ok) {
          setStatus('success')
          form.reset()
        } else {
          setStatus('error')
        }
      } catch {
        setStatus('error')
      }
    } else {
      // Localhost fallback: open mailto
      const subject = encodeURIComponent(`Portfolio message from ${name}`)
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`)
      window.location.href = `mailto:${resume.email}?subject=${subject}&body=${body}`
      form.reset()
      handleClose()
    }
  }

  if (!resume.email) return null

  // Expandable bubble with form (works with Formspree or mailto fallback)
  // Form uses fixed positioning so it never shifts Case Studies and Projects / Experience
  return (
    <>
      {!standalone && (
        <div className="sayhi-bubble">
          <button
            type="button"
            className={isNavLink ? "nav-link bird-perch nav-contact-btn" : "hero-cta hero-cta-bubble sayhi-trigger"}
            onClick={() => setIsOpen(true)}
            aria-expanded={isOpen}
            aria-haspopup="dialog"
            aria-label="Open contact form"
          >
            Contact
          </button>
        </div>
      )}
      {isOpen &&
        createPortal(
          <div className="sayhi-backdrop" onClick={handleClose} aria-hidden>
            <div
              className="sayhi-form-wrap"
              role="dialog"
              aria-label="Contact form"
              aria-modal="true"
              onClick={(e) => e.stopPropagation()}
            >
              <form className="sayhi-form" onSubmit={handleSubmit} noValidate>
                <input type="hidden" name="form-name" value={resume.contactFormName} />
                <div className="sayhi-honeypot" aria-hidden="true">
                  <label htmlFor="sayhi-bot-field">Leave this empty</label>
                  <input
                    id="sayhi-bot-field"
                    name="bot-field"
                    type="text"
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>
                <button
                  type="button"
                  className="sayhi-close"
                  onClick={handleClose}
                  aria-label="Close form"
                >
                  ×
                </button>

                {status === 'success' ? (
                  <div className="sayhi-success">
                    <p>Thanks! I&apos;ll get back to you soon.</p>
                    <button type="button" className="sayhi-cta" onClick={handleClose}>
                      Close
                    </button>
                  </div>
                ) : (
                  <>
                    <label htmlFor="sayhi-name" className="sayhi-label">Name</label>
                    <input
                      id="sayhi-name"
                      name="name"
                      type="text"
                      className={`sayhi-input${fieldErrors.name ? ' sayhi-input-invalid' : ''}`}
                      placeholder="Your name"
                      required
                      aria-required="true"
                      aria-invalid={fieldErrors.name ? 'true' : undefined}
                      aria-describedby={fieldErrors.name ? 'sayhi-name-error' : undefined}
                      autoComplete="name"
                      maxLength={FIELD_LIMITS.name}
                      disabled={status === 'submitting'}
                      onChange={() => fieldErrors.name && setFieldErrors((prev) => ({ ...prev, name: undefined }))}
                    />
                    {fieldErrors.name && (
                      <p id="sayhi-name-error" className="sayhi-field-error" role="alert">
                        {fieldErrors.name}
                      </p>
                    )}
                    <label htmlFor="sayhi-email" className="sayhi-label">Email</label>
                    <input
                      id="sayhi-email"
                      name="email"
                      type="email"
                      className={`sayhi-input${fieldErrors.email ? ' sayhi-input-invalid' : ''}`}
                      placeholder="your@email.com"
                      required
                      aria-required="true"
                      aria-invalid={fieldErrors.email ? 'true' : undefined}
                      aria-describedby={fieldErrors.email ? 'sayhi-email-error' : undefined}
                      autoComplete="email"
                      inputMode="email"
                      maxLength={FIELD_LIMITS.email}
                      disabled={status === 'submitting'}
                      onChange={() => fieldErrors.email && setFieldErrors((prev) => ({ ...prev, email: undefined }))}
                    />
                    {fieldErrors.email && (
                      <p id="sayhi-email-error" className="sayhi-field-error" role="alert">
                        {fieldErrors.email}
                      </p>
                    )}
                    <label htmlFor="sayhi-message" className="sayhi-label">Message</label>
                    <textarea
                      id="sayhi-message"
                      name="message"
                      className={`sayhi-textarea${fieldErrors.message ? ' sayhi-input-invalid' : ''}`}
                      placeholder="Say hello..."
                      rows={3}
                      required
                      aria-required="true"
                      aria-invalid={fieldErrors.message ? 'true' : undefined}
                      aria-describedby={fieldErrors.message ? 'sayhi-message-error' : undefined}
                      maxLength={FIELD_LIMITS.message}
                      disabled={status === 'submitting'}
                      onChange={() => fieldErrors.message && setFieldErrors((prev) => ({ ...prev, message: undefined }))}
                    />
                    {fieldErrors.message && (
                      <p id="sayhi-message-error" className="sayhi-field-error" role="alert">
                        {fieldErrors.message}
                      </p>
                    )}
                    {status === 'error' && (
                      <p className="sayhi-error">Something went wrong. Try emailing directly.</p>
                    )}
                    <div className="sayhi-actions">
                      <button
                        type="button"
                        className="sayhi-cta sayhi-cta-ghost"
                        onClick={handleClose}
                        disabled={status === 'submitting'}
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="sayhi-cta sayhi-cta-primary"
                        disabled={status === 'submitting'}
                      >
                        {status === 'submitting' ? 'Sending…' : 'Send'}
                      </button>
                    </div>
                  </>
                )}
              </form>
            </div>
          </div>,
          document.body
        )}
    </>
  )
}
