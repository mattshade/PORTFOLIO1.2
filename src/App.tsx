import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { ResumePage } from './pages/ResumePage'
import { ContactPage } from './pages/ContactPage'
import { ScrollToHash } from './components/ScrollToHash'
import { AtsJsonLd } from './components/AtsJsonLd'
import { SayHiBubble } from './components/SayHiBubble'
import './App.css'

function App() {
  return (
    <>
      <AtsJsonLd />
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resume" element={<ResumePage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Routes>
      <SayHiBubble standalone />
    </>
  )
}

export default App
