import React, { useState } from "react";
import { Routes, Route } from "react-router-dom";
import { getPartnerCodeFromPath } from "../../config/partners";
import PartnerMain from "./index";
import NotFoundPage from "../../components/NotFoundPage";

function PartnerRouter() {
  const [partnerId] = useState(getPartnerCodeFromPath());

  return (
    <Routes>
      <Route
        path="/"
        element={
          <PartnerMain partnerId={partnerId}/>
        }
      />
      {/* 중복된 경로 제거, 파라미터 경로는 유지 */}
      <Route
        path="/:path"
        element={
          <PartnerMain partnerId={partnerId} />
        }
      />
      {/* 와일드카드 경로를 NotFoundPage로 변경 */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default PartnerRouter;
