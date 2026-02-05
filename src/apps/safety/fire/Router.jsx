import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import FireMain from "./main/index";

const FireRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<FireMain />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default FireRouter;
