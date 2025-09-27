import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainApp from './MainApp';
import AdminPanel from './components/AdminPanel';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MainApp />} />
        <Route path="/admin" element={<AdminPanel />} />
        <Route path="/admin/*" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
