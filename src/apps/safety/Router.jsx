import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Safety from './index';

const SafetyRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Safety />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default SafetyRouter;