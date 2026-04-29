import { Routes, Route, Navigate } from 'react-router-dom';
import { useApp } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Garden from './pages/Garden';
import PlantDetail from './pages/PlantDetail';
import AddEditPlant from './pages/AddEditPlant';
import Shed from './pages/Shed';
import Greenhouse from './pages/Greenhouse';
import Settings from './pages/Settings';
import Setup from './pages/Setup';

export default function App() {
  const { state } = useApp();

  if (!state.profile) {
    return <Setup />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/garden" element={<Garden />} />
        <Route path="/garden/plant/:id" element={<PlantDetail />} />
        <Route path="/garden/add" element={<AddEditPlant />} />
        <Route path="/garden/edit/:id" element={<AddEditPlant />} />
        <Route path="/shed" element={<Shed />} />
        <Route path="/greenhouse" element={<Greenhouse />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}
