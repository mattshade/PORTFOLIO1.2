import { useState, FormEvent } from 'react'
import { resume } from '../data/resume'
import './SayHiBubble.css'

export function SayHiBubble() {
  const [isOpen, setIsOpen] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')

  const hasFormspree = !!resume.contactFormEndpoint
  const useNetlify = !hasFormspree && typeof window !== 'undefined' && window.location.hostname !== 'localhost'

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const form = e.currentTarget
    const data = new FormData(form)
    const name = (data.get('name') as string) || 'Someone'
    const email = (data.get('email') as string) || ''
    const message = (data.get('message') as string) || ''

    if (hasFormspree) {
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
      setIsOpen(false)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => setStatus('idle'), 300)
  }

  if (!resume.email) return null

  // Expandable bubble with form (works with Formspree or mailto fallback)
  // Form uses fixed positioning so it never shifts View projects / Experience
  return (
    <>
      <div className="sayhi-bubble">
        <button
          type="button"
          className="hero-cta hero-cta-bubble sayhi-trigger"
          onClick={() => setIsOpen(true)}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label="Open contact form"
        >
          Say hi
        </button>
      </div>
      {isOpen && (
        <>
          <div
            className="sayhi-backdrop"
            onClick={handleClose}
            aria-hidden
          />
          <div className="sayhi-form-wrap" role="dialog" aria-label="Contact form">
          <form className="sayhi-form" onSubmit={handleSubmit} noValidate>
            <input type="hidden" name="form-name" value={resume.contactFormName} />
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
                  className="sayhi-input"
                  placeholder="Your name"
                  required
                  autoFocus
                  disabled={status === 'submitting'}
                />
                <label htmlFor="sayhi-email" className="sayhi-label">Email</label>
                <input
                  id="sayhi-email"
                  name="email"
                  type="email"
                  className="sayhi-input"
                  placeholder="your@email.com"
                  required
                  disabled={status === 'submitting'}
                />
                <label htmlFor="sayhi-message" className="sayhi-label">Message</label>
                <textarea
                  id="sayhi-message"
                  name="message"
                  className="sayhi-textarea"
                  placeholder="Say hello..."
                  rows={3}
                  required
                  disabled={status === 'submitting'}
                />
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
      </>
      )}
    </>
  )
}
