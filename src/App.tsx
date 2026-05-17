import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { ResumePage } from './pages/ResumePage'
import { ContactPage } from './pages/ContactPage'
import { DesignSystemPage } from './pages/DesignSystemPage'
import { ProjectEmbedPage } from './pages/ProjectEmbedPage'
import { ScrollToHash } from './components/ScrollToHash'
import { AtsJsonLd } from './components/AtsJsonLd'
import { SayHiBubble } from './components/SayHiBubble'
import { OrigamiAviaryBackground } from './components/OrigamiAviaryBackground/OrigamiAviaryBackground'
import './App.css'

function App() {
  return (
    <>
      <OrigamiAviaryBackground />
      <AtsJsonLd />
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/design-system" element={<DesignSystemPage />} />
        <Route path="/project/:id" element={<ProjectEmbedPage />} />
      </Routes>
      <SayHiBubble standalone />
    </>
  )
}

export default App
