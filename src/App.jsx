import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import AdminLayout from './components/AdminLayout';
import Login from './pages/Login';
import Home from './pages/Home';
import Fuel from './pages/Fuel';
import Maintenance from './pages/Maintenance';

import AdminDashboard from './pages/admin/AdminDashboard';
import UserList from './pages/admin/UserList';
import AttendanceList from './pages/admin/AttendanceList';
import FuelStatusList from './pages/admin/FuelStatusList';
import MaintenanceList from './pages/admin/MaintenanceList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Driver Routes */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/fuel" element={<Fuel />} />
          <Route path="/maintenance" element={<Maintenance />} />
        </Route>

        {/* Admin/Supervisor Routes */}
        <Route element={<AdminLayout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserList />} />
          <Route path="/admin/attendance" element={<AttendanceList />} />
          <Route path="/admin/fuel" element={<FuelStatusList />} />
          <Route path="/admin/maintenance" element={<MaintenanceList />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
