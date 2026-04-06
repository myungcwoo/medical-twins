import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Explanation } from './components/Explanation';
import { TimelineView } from './components/TimelineView';
import { IngestionView } from './components/IngestionView';
import { NetworkFeed } from './components/NetworkFeed';
import { DashboardView } from './components/DashboardView';
import { SimulationReport } from './components/SimulationReport';
import { CustomTwinDashboard } from './components/CustomTwinDashboard';
import { TrainingDashboard } from './components/TrainingDashboard';
import { BackendTrainer } from './components/BackendTrainer';
import { ConsumerWizard } from './components/ConsumerWizard';
import { FAQView } from './components/FAQView';
import { DevDocumentation } from './components/DevDocumentation';
import { LiteratureBoard } from './components/LiteratureBoard';
import heroBg from './assets/hero_bg.png';
import { MainLayout } from './components/layout/MainLayout';
import { useSimulationLifecycle } from './hooks/useSimulation';

import { AlgorithmExplanationView } from './components/AlgorithmExplanationView';

function App() {
  useSimulationLifecycle();

  const [selectedId, setSelectedId] = useState<string>('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelectAgent = (id: string) => {
    setSelectedId(id);
    if (id) {
      navigate('/timeline');
    } else {
      navigate('/dashboard');
    }
  };

  useEffect(() => {
    // Force strict Vite hot-reloading for the Nano Banana background
    document.body.style.backgroundImage = `url(${heroBg})`;
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
    document.body.style.backgroundAttachment = 'fixed';
  }, []);

  return (
    <MainLayout
      isMobileMenuOpen={isMobileMenuOpen}
      setIsMobileMenuOpen={setIsMobileMenuOpen}
    >
      <Routes>
        <Route path="/dashboard" element={<DashboardView onSelectAgent={handleSelectAgent} />} />
        <Route path="/timeline" element={<TimelineView selectedId={selectedId} onSelectAgent={handleSelectAgent} />} />
        <Route path="/explanation" element={<Explanation />} />
        <Route path="/algorithms" element={<AlgorithmExplanationView />} />
        <Route path="/faq" element={<FAQView />} />
        <Route path="/ingestion" element={
          <div className="tab-pane active" id="ingestion">
            <IngestionView />
            <div id="simulate-me-dashboard">
               <CustomTwinDashboard />
            </div>
          </div>
        } />
        <Route path="/literature" element={<LiteratureBoard />} />
        <Route path="/network" element={<NetworkFeed />} />
        <Route path="/report" element={<SimulationReport />} />
        <Route path="/training" element={<TrainingDashboard />} />
        <Route path="/backend-train" element={<BackendTrainer />} />
        <Route path="/consumer-wizard" element={
          <div className="tab-pane active" id="consumer-wizard">
            <ConsumerWizard />
            <div id="simulate-me-dashboard">
               <CustomTwinDashboard />
            </div>
          </div>
        } />
        <Route path="/dev-docs" element={<DevDocumentation />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </MainLayout>
  );
}

export default App;
