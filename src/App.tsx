import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { StoreProvider } from './store';
import MainScreen from './pages/MainScreen';
import EntryPage from './pages/EntryPage';
import ProjectFiles from './pages/ProjectFiles';
import ProjectDetail from './pages/ProjectDetail';
import Statistics from './pages/Statistics';
import PromptGallery from './pages/PromptGallery';
import PromptDetail from './pages/PromptDetail';
import RecycleBin from './pages/RecycleBin';
import Layout from './components/Layout';
import { AnimatePresence, motion } from 'motion/react';

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location}>
        <Route path="/" element={<motion.div key="main" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full flex flex-col"><MainScreen /></motion.div>} />
        <Route path="/entry" element={<motion.div key="entry-new" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full flex flex-col"><EntryPage /></motion.div>} />
        <Route path="/entry/:id" element={<motion.div key={`entry-${location.pathname}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full flex flex-col"><EntryPage /></motion.div>} />
        <Route path="/projects" element={<motion.div key="projects" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full flex flex-col"><ProjectFiles /></motion.div>} />
        <Route path="/project/:id" element={<motion.div key={`project-${location.pathname}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full flex flex-col"><ProjectDetail /></motion.div>} />
        <Route path="/prompts" element={<motion.div key="prompts" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full flex flex-col"><PromptGallery /></motion.div>} />
        <Route path="/prompt/:id" element={<motion.div key={`prompt-${location.pathname}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full flex flex-col"><PromptDetail /></motion.div>} />
        <Route path="/bin" element={<motion.div key="bin" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full flex flex-col"><RecycleBin /></motion.div>} />
        <Route path="/stats" element={<motion.div key="stats" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="h-full flex flex-col"><Statistics /></motion.div>} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <BrowserRouter>
        <Layout>
          <AnimatedRoutes />
        </Layout>
      </BrowserRouter>
    </StoreProvider>
  );
}
