import { Nav } from '../components/Nav'
import { Hero } from '../components/Hero'
import { Bio } from '../components/Bio'
import { Projects } from '../components/Projects'
import { Experience } from '../components/Experience'
import { AboutContent } from '../components/AboutContent'
import { ContactSection } from '../components/ContactSection'
import { Footer } from '../components/Footer'
import { BackToTop } from '../components/BackToTop'
import '../components/AboutContent.css'

export function HomePage() {
  return (
    <>
      <div className="app-content">
        <Nav />
        <main id="main-content">
          <Hero />
          <Bio />
          <Projects />
          <Experience />
          <section id="about" className="section about-section" aria-labelledby="about-heading">
            <div className="about-section__scrim" aria-hidden />
            <div className="section-inner">
              <header className="about-section__header">
                <h2 id="about-heading" className="section-title section-title--mono">
                  About
                </h2>
              </header>
              <div className="about-panel glass">
                <AboutContent />
              </div>
            </div>
          </section>
          <ContactSection />
          <Footer />
        </main>
        <BackToTop />
      </div>
    </>
  )
}
