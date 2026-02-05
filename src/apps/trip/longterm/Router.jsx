//overseas
import React, { useEffect, useState } from "react";
import { Route, Routes, useLocation } from "react-router-dom";
import useScrollToTop from "../../../hooks/useNavigateWithScrollToTop";

// Common Components
import Header from "../../../components/headers/Header";
import NotFoundPage from "../../../components/NotFoundPage";
import IndividualInfo from "../../../components/footer/IndividualInfo";
import ServiceInfo from "../../../components/footer/ServiceAnnounce";

// Calculation Process Components
import Progressbar from "./components/Progressbar";
import Intro from "./intro/index";
import Insert from "./insert/Insert";
import TripSelect from "./nation/TripSelect";
import Indemnity from "./indemnity/Indemnity";
import Confirm from "./confirm/Confirm";
import ExcelUpLoad from "./upload/ExcelUpLoad";
import Upload from "./upload/Upload";

// Sign Up Process Components
import SignProgress from "./components/SignProgress";
import Member from "./members/Member";
import CompanionMembers from "./members/CompanionMembers";
import GuaranteeChk from "./guaranteeChk/GuaranteeChk";
import Finish from "./finish/Finish";
import AgreeContents from "./agree/AgreeContents";
import agreeContentsItem from "../../../data/agreeContentsItem";
import Purpose from "./purpose";
import useAppStateReset from "../../../hooks/useAppReset";

function Router() {
  const [showHeader, setShowHeader] = useState(true);
  const [showbar, setShowbar] = useState(true);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const [faRetrustData, setFaRetrustData] = useState(null);
  useAppStateReset("LONGTERM");
  useScrollToTop();

  useEffect(() => {
    const birthDate = searchParams.get("birthDate");
    const gender = searchParams.get("gender");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    setFaRetrustData({ birthDate, gender, startDate, endDate });
  }, []);

  return (
    <Routes>
      {/* Calculation Process Routes */}
      <Route
        path="/"
        element={
          <>
            <Intro setShowHeader={setShowHeader} setShowbar={setShowbar} />
          </>
        }
      />
      <Route
        path="/insert"
        element={
          <>
            {showHeader && <Header />}
            {showbar && <Progressbar />}
            <Insert faRetrustData={faRetrustData} />
          </>
        }
      />
      <Route
        path="/upload"
        element={
          <>
            {showHeader && <Header />}
            <Upload faRetrustData={faRetrustData} />
          </>
        }
      />
      <Route
        path="/groupEstimate"
        element={
          <>
            {showHeader && <Header />}
            <ExcelUpLoad faRetrustData={faRetrustData} />
          </>
        }
      />
      <Route
        path="/trip"
        element={
          <>
            {showbar && <Progressbar />}
            <TripSelect />
          </>
        }
      />
      <Route
        path="/purpose"
        element={
          <>
            {showHeader && <Header />}
            {showbar && <Progressbar />}
            <Purpose />
          </>
        }
      />
      <Route
        path="/indemnity"
        element={
          <>
            {showHeader && <Header />}
            {showbar && <Progressbar />}
            <Indemnity />
          </>
        }
      />
      <Route
        path="/confirm"
        element={
          <>
            {showHeader && <Header />}
            {showbar && <Progressbar />}
            <Confirm />
          </>
        }
      />

      {/* Sign Up Process Routes */}
      <Route
        path="signup/member"
        element={
          <>
            <Header TitleText={true} />
            <SignProgress />
            <Member />
          </>
        }
      />
      <Route
        path="signup/companionmembers"
        element={
          <>
            <Header TitleText={true} />
            <SignProgress />
            <CompanionMembers />
          </>
        }
      />
      <Route
        path="signup/agreeitem/:agreement"
        element={<AgreeContents agreeContentsItem={agreeContentsItem} />}
      />
      <Route
        path="signup/guarantee"
        element={
          <>
            <Header TitleText={true} />
            <SignProgress />
            <GuaranteeChk />
          </>
        }
      />
      <Route
        path="signup/finish/:tid/:amt/:moid"
        element={
          <>
            <Header TitleText={true} />
            <SignProgress />
            <Finish />
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
