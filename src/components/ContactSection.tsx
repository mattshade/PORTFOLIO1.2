import { ContactForm } from './ContactForm'
import './ContactSection.css'

export function ContactSection() {
  return (
    <section id="contact" className="section contact-section" aria-labelledby="contact-heading">
      <div className="section-inner">
        <header className="contact-section__header">
          <h2 id="contact-heading" className="section-title section-title--mono">
            Contact
          </h2>
          <p className="section-desc">
            Consulting, leadership roles, or product strategy — send a note and I&apos;ll get back to you.
          </p>
        </header>
        <div className="contact-section__panel glass">
          <ContactForm />
        </div>
      </div>
    </section>
  )
}
