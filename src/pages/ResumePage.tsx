import { useEffect } from 'react'
import { Nav } from '../components/Nav'
import { Resume } from '../components/Resume'
import { Footer } from '../components/Footer'
import { BackToTop } from '../components/BackToTop'

export function ResumePage() {
  useEffect(() => {
    const prev = document.title
    document.title = 'Matt Shade — Resume'
    return () => {
      document.title = prev
    }
  }, [])

  return (
    <>
      <div className="app-content">
        <Nav />
        <main id="main-content">
          <Resume />
        </main>
        <Footer />
        <BackToTop />
      </div>
    </>
  )
}
