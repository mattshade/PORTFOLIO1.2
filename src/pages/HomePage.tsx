import { Nav } from '../components/Nav'
import { Hero } from '../components/Hero'
import { Bio } from '../components/Bio'
import { Projects } from '../components/Projects'
import { Experience } from '../components/Experience'
import { AboutContent } from '../components/AboutContent'
import { AboutDnaBackground } from '../components/AboutDnaBackground/AboutDnaBackground'
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
          <div id="about-descent-start" className="about-descent-marker" aria-hidden />
          <div className="about-transition-spacer" aria-hidden />
          <div id="about-descent-end" className="about-descent-marker" aria-hidden />
          <div id="about-vine-region" className="about-vine-region">
            <AboutDnaBackground />
            <section id="about" className="about-journey" aria-label="About Matt Shade">
              <div className="about-journey__edge-fade about-journey__edge-fade--top" aria-hidden />
              <div className="about-journey__scrim" aria-hidden />
              <div className="about-journey__column">
                <AboutContent />
              </div>
              <div id="about-journey-end" className="about-descent-marker" aria-hidden />
            </section>
            <Footer />
            <div id="about-vine-end" className="about-descent-marker" aria-hidden />
          </div>
        </main>
        <BackToTop />
      </div>
    </>
  )
}
