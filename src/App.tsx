import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { StoreProvider } from './store';
import MainScreen from './pages/MainScreen';
import EntryPage from './pages/EntryPage';
import ProjectFiles from './pages/ProjectFiles';
import ProjectDetail from './pages/ProjectDetail';
import Statistics from './pages/Statistics';
import Layout from './components/Layout';

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<MainScreen />} />
            <Route path="/entry" element={<EntryPage />} />
            <Route path="/entry/:id" element={<EntryPage />} />
            <Route path="/projects" element={<ProjectFiles />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/stats" element={<Statistics />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </StoreProvider>
  );
}
