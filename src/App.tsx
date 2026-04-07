import { Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { ResumePage } from './pages/ResumePage'
import { ScrollToHash } from './components/ScrollToHash'
import './App.css'

function App() {
  return (
    <>
      <ScrollToHash />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/resume" element={<ResumePage />} />
      </Routes>
    </>
  )
}

export default App
