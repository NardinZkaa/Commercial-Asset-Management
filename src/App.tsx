import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AssetRegistry from './pages/AssetRegistry';
import AuditTasks from './pages/AuditTasks';
import AssignAssets from './pages/AssignAssets';
import Reports from './pages/Reports';
import Transfers from './pages/Transfers';
import EnhancedDashboard from './pages/EnhancedDashboard';
import AssetAcquisition from './pages/AssetAcquisition';

import Settings from './pages/Settings';
import MaintenanceRequests from './pages/MaintenanceRequests';
import MaintenancePortal from './pages/MaintenancePortal';
import HelpDesk from './pages/HelpDesk';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="enhanced-dashboard" element={<EnhancedDashboard />} />
          <Route path="registry" element={<AssetRegistry />} />
          <Route path="audit-tasks" element={<AuditTasks />} />
          <Route path="assign-assets" element={<AssignAssets />} />
          <Route path="transfers" element={<Transfers />} />
          <Route path="reports" element={<Reports />} />
          <Route path="acquisition" element={<AssetAcquisition />} />

          <Route path="generate-assets" element={<AssetRegistry />} />
          <Route path="settings" element={<Settings />} />
          <Route path="maintenance-requests" element={<MaintenanceRequests />} />
          <Route path="maintenance-portal" element={<MaintenancePortal />} />
          <Route path="help-desk" element={<HelpDesk />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;