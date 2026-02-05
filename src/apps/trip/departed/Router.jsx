// src/apps/departed/Router.js
import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import useScrollToTop from "../../../hooks/useNavigateWithScrollToTop";

// Common Components
import Header from "../../../components/headers/Header";
import NotFoundPage from "../../../components/NotFoundPage";
import IndividualInfo from "../../../components/footer/IndividualInfo";
import ServiceInfo from "../../../components/footer/ServiceAnnounce";

// Dpt Components
import DptProgressbar from "./DptProgressbar";
import DptIntro from "./DptIntro";
import DptInsert from "./DptInsert";
import DptTripSelect from "./DptTripSelect";
import DptIndemnity from "./DptIndemnity";
import DptConfirm from "./DptConfirm";
import DptSignProgress from "./DptSignProgress";
import DptMember from "./DptMember";
import DptCompanionMembers from "./DptCompanionMembers";
import DptGuaranteeChk from "./DptGuaranteeChk";
import DptFinish from "./DptFinish";
import useAppStateReset from "../../../hooks/useAppReset";
import DptAgreeContents from "./DptAgreeContents";

function Router() {
  const [showHeader, setShowHeader] = useState(true);
  const [showbar, setShowbar] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [faRetrustData, setFaRetrustData] = useState(null);

  useScrollToTop();
  useAppStateReset("DEPARTED");

  useEffect(() => {
    const birthDate = searchParams.get("birthDate");
    const gender = searchParams.get("gender");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    setFaRetrustData({ birthDate, gender, startDate, endDate });
  }, []);

  return (
    <Routes>
      <Route
        path="/"
        element={
          <>
            {showHeader && <Header />}
            {showbar && <DptProgressbar />}
            <DptIntro setShowHeader={setShowHeader} setShowbar={setShowbar} />
          </>
        }
      />
      <Route
        path="/insert"
        element={
          <>
            {showHeader && <Header />}
            {showbar && <DptProgressbar />}
            <DptInsert faRetrustData={faRetrustData} />
          </>
        }
      />
      <Route
        path="/trip"
        element={
          <>
            {showbar && <DptProgressbar />}
            <DptTripSelect />
          </>
        }
      />
      <Route
        path="/indemnity"
        element={
          <>
            {showHeader && <Header />}
            {showbar && <DptProgressbar />}
            <DptIndemnity />
          </>
        }
      />
      <Route
        path="/confirm"
        element={
          <>
            {showHeader && <Header />}
            {showbar && <DptProgressbar />}
            <DptConfirm />
          </>
        }
      />
      {/* Sign Up Process Routes */}
      <Route
        path="/signup/member"
        element={
          <>
            <Header TitleText={true} />
            <DptSignProgress />
            <DptMember />
          </>
        }
      />
      <Route
        path="/signup/companionmembers"
        element={
          <>
            <Header TitleText={true} />
            <DptSignProgress />
            <DptCompanionMembers />
          </>
        }
      />
      <Route
        path="/signup/agreeitem/:agreement"
        element={<DptAgreeContents />}
      />
      <Route
        path="/signup/guarantee"
        element={
          <>
            <Header TitleText={true} />
            <DptSignProgress />
            <DptGuaranteeChk />
          </>
        }
      />
      <Route
        path="/signup/finish/:tid/:amt/:moid"
        element={
          <>
            <Header TitleText={true} />
            <DptSignProgress />
            <DptFinish />
          </>
        }
      />
      {/* 푸터 개인정보처리방침, 서비스이용약관*/}
      <Route path="/individualInfo" element={<IndividualInfo />} />
      <Route path="/serviceInfo" element={<ServiceInfo />} />

      {/* Not Found Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default Router;
