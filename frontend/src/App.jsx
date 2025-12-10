import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import DataManagement from './pages/DataManagement';
import Optimizer from './pages/Optimizer';
import ScheduleViewer from './pages/ScheduleViewer';
import Analytics from './pages/Analytics';

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/data" element={<DataManagement />} />
          <Route path="/optimize" element={<Optimizer />} />
          <Route path="/schedule" element={<ScheduleViewer />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
