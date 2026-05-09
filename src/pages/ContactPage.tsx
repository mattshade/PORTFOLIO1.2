import { Nav } from '../components/Nav'
import { Footer } from '../components/Footer'
import { resume } from '../data/resume'
import './ContactPage.css'

const contactUrl = 'https://www.mattshade.com/contact'

export function ContactPage() {
  return (
    <>
      <div className="app-content">
        <Nav />
        <main id="main-content">
          <section className="contact-page section">
            <div className="section-inner contact-page-inner glass">
              <h1 className="section-title">Contact Matt Shade</h1>
              <p className="section-desc">
                For consulting, leadership roles, or product strategy discussions,
                use the Mattshade contact page.
              </p>

              <div className="contact-page-links">
                <a
                  href={contactUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-primary-link"
                >
                  Open Mattshade Contact Page
                </a>
                {resume.email && (
                  <a href={`mailto:${resume.email}`} className="contact-secondary-link">
                    Or email {resume.email}
                  </a>
                )}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  )
}
