import { Nav } from '../components/Nav'
import { Resume } from '../components/Resume'
import { Footer } from '../components/Footer'

export function ResumePage() {
  return (
    <div className="app-content">
      <Nav />
      <Resume />
      <Footer />
    </div>
  )
}
