import { Nav } from '../components/Nav'
import { Hero } from '../components/Hero'
import { Bio } from '../components/Bio'
import { Projects } from '../components/Projects'
import { Experience } from '../components/Experience'
import { Footer } from '../components/Footer'
import { BackToTop } from '../components/BackToTop'

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
        </main>
        <Footer />
        <BackToTop />
      </div>
    </>
  )
}
