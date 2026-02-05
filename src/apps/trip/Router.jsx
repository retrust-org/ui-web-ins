import React from "react";
import { Routes, Route } from "react-router-dom";
import Trip from "./index";
import NotFoundPage from "../../components/NotFoundPage";

const TripRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Trip />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};

export default TripRouter;
