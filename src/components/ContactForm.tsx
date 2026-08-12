import { useState, FormEvent } from 'react'
import { resume } from '../data/resume'
import {
  CONTACT_FIELD_LIMITS,
  validateContactFields,
  type ContactFieldErrors,
} from '../utils/contactFormValidation'
import './ContactForm.css'

type FieldErrors = ContactFieldErrors

export function ContactForm() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const hasFormspree = !!resume.contactFormEndpoint
  const useNetlify = !hasFormspree && typeof window !== 'undefined' && window.location.hostname !== 'localhost'

  if (!resume.email) return null

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)

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
      const subject = encodeURIComponent(`Portfolio message from ${name}`)
      const body = encodeURIComponent(`${message}\n\n— ${name} (${email})`)
      window.location.href = `mailto:${resume.email}?subject=${subject}&body=${body}`
      form.reset()
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit} noValidate>
      <input type="hidden" name="form-name" value={resume.contactFormName} />
      <div className="contact-form__honeypot" aria-hidden="true">
        <label htmlFor="contact-bot-field">Leave this empty</label>
        <input id="contact-bot-field" name="bot-field" type="text" tabIndex={-1} autoComplete="off" />
      </div>

      {status === 'success' ? (
        <div className="contact-form__success">
          <p>Thanks! I&apos;ll get back to you soon.</p>
          <button type="button" className="contact-form__cta" onClick={() => setStatus('idle')}>
            Send another message
          </button>
        </div>
      ) : (
        <>
          <label htmlFor="contact-name" className="contact-form__label">
            Name
          </label>
          <input
            id="contact-name"
            name="name"
            type="text"
            className={`contact-form__input${fieldErrors.name ? ' contact-form__input--invalid' : ''}`}
            placeholder="Your name"
            required
            aria-required="true"
            aria-invalid={fieldErrors.name ? 'true' : undefined}
            aria-describedby={fieldErrors.name ? 'contact-name-error' : undefined}
            autoComplete="name"
            maxLength={CONTACT_FIELD_LIMITS.name}
            disabled={status === 'submitting'}
            onChange={() => fieldErrors.name && setFieldErrors((prev) => ({ ...prev, name: undefined }))}
          />
          {fieldErrors.name && (
            <p id="contact-name-error" className="contact-form__field-error" role="alert">
              {fieldErrors.name}
            </p>
          )}

          <label htmlFor="contact-email" className="contact-form__label">
            Email
          </label>
          <input
            id="contact-email"
            name="email"
            type="email"
            className={`contact-form__input${fieldErrors.email ? ' contact-form__input--invalid' : ''}`}
            placeholder="your@email.com"
            required
            aria-required="true"
            aria-invalid={fieldErrors.email ? 'true' : undefined}
            aria-describedby={fieldErrors.email ? 'contact-email-error' : undefined}
            autoComplete="email"
            inputMode="email"
            maxLength={CONTACT_FIELD_LIMITS.email}
            disabled={status === 'submitting'}
            onChange={() => fieldErrors.email && setFieldErrors((prev) => ({ ...prev, email: undefined }))}
          />
          {fieldErrors.email && (
            <p id="contact-email-error" className="contact-form__field-error" role="alert">
              {fieldErrors.email}
            </p>
          )}

          <label htmlFor="contact-message" className="contact-form__label">
            Message
          </label>
          <textarea
            id="contact-message"
            name="message"
            className={`contact-form__textarea${fieldErrors.message ? ' contact-form__input--invalid' : ''}`}
            placeholder="Say hello..."
            rows={4}
            required
            aria-required="true"
            aria-invalid={fieldErrors.message ? 'true' : undefined}
            aria-describedby={fieldErrors.message ? 'contact-message-error' : undefined}
            maxLength={CONTACT_FIELD_LIMITS.message}
            disabled={status === 'submitting'}
            onChange={() => fieldErrors.message && setFieldErrors((prev) => ({ ...prev, message: undefined }))}
          />
          {fieldErrors.message && (
            <p id="contact-message-error" className="contact-form__field-error" role="alert">
              {fieldErrors.message}
            </p>
          )}

          {status === 'error' && (
            <p className="contact-form__error">Something went wrong. Try emailing directly.</p>
          )}

          <div className="contact-form__actions">
            <button type="submit" className="contact-form__cta contact-form__cta--primary" disabled={status === 'submitting'}>
              {status === 'submitting' ? 'Sending…' : 'Send message'}
            </button>
          </div>
        </>
      )}
    </form>
  )
}
