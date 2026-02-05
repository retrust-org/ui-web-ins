import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import DisasterMain from "./main/index";

const DisasterRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<DisasterMain />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default DisasterRouter;
