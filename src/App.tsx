import { Routes, Route, useLocation } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { ResumePage } from './pages/ResumePage'
import { ContactPage } from './pages/ContactPage'
import { DesignSystemPage } from './pages/DesignSystemPage'
import { ScrollToHash } from './components/ScrollToHash'
import { AtsJsonLd } from './components/AtsJsonLd'
import { ProjectDetailOverlay } from './components/ProjectDetailOverlay'
import { OrigamiAviaryBackground } from './components/OrigamiAviaryBackground/OrigamiAviaryBackground'
import { LandscapeGate } from './components/LandscapeGate'
import './App.css'

function AppRoutes() {
  const location = useLocation()
  const state = location.state as { background?: typeof location } | null
  const isProjectPath = location.pathname.startsWith('/project/')
  const mainLocation =
    state?.background ??
    (isProjectPath ? { ...location, pathname: '/', search: '', hash: '' } : location)

  return (
    <>
      <Routes location={mainLocation}>
        <Route path="/" element={<HomePage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
      </Routes>

      {(state?.background || isProjectPath) && (
        <Routes>
          <Route path="/project/:id" element={<ProjectDetailOverlay />} />
        </Routes>
      )}
    </>
  )
}

function App() {
  return (
    <>
      <LandscapeGate />
      <OrigamiAviaryBackground />
      <AtsJsonLd />
      <ScrollToHash />
      <AppRoutes />
    </>
  )
}

export default App
