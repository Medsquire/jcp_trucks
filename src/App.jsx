import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import Fuel from './pages/Fuel';
import Maintenance from './pages/Maintenance';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        
        {/* Protected routes */}
        <Route element={<Layout />}>
          <Route path="/home" element={<Home />} />
          <Route path="/fuel" element={<Fuel />} />
          <Route path="/maintenance" element={<Maintenance />} />
        </Route>
        
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
