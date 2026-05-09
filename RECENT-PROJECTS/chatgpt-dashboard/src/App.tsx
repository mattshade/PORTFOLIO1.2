import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { Layout } from './components/Layout/Layout';
import { Overview } from './pages/Overview';
import { Adoption } from './pages/Adoption';
import { Engagement } from './pages/Engagement';
import { OfficeHours } from './pages/OfficeHours';
import { ExecutiveView } from './pages/ExecutiveView';

function App() {
  return (
    <DataProvider>
      <BrowserRouter basename="/projects/chatgpt-dashboard">
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Overview />} />
            <Route path="adoption" element={<Adoption />} />
            <Route path="engagement" element={<Engagement />} />
            <Route path="office-hours" element={<OfficeHours />} />
            <Route path="executive" element={<ExecutiveView />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </DataProvider>
  );
}

export default App;
