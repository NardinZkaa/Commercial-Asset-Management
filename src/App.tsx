import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import AssetRegistry from './pages/AssetRegistry';
import AuditTasks from './pages/AuditTasks';
import AssignAssets from './pages/AssignAssets';

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
          <Route path="registry" element={<AssetRegistry />} />
          <Route path="audit-tasks" element={<AuditTasks />} />
          <Route path="assign-assets" element={<AssignAssets />} />

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