import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import useScrollToTop from "../../../hooks/useNavigateWithScrollToTop";
import Main from "./main/index";
import Address from "./address/index";
import AddressSearch from "./address/AddressSearch";
import DongSelector from "./address/DongSelector";
import FloorSelector from "./address/FloorSelector";
import ResultDisplay from "./address/ResultDisplay";
import InsuranceDate from "./insuranceDate/index";
import Price from "./price/index";
import LimitsAnnounce from "./consentform/LimitsAnnounce";
import ConsentAgreement from "./consentform/ConsentAgreement";
import PersonalInfoConsent from "./consentform/PersonalInfoConsent";
import SignupChkConsent from "./consentform/SignupChkConsent";
import UserInfo from "./userinfo/index";
import BusinessInfo from "./userinfo/BusinessInfo";
import Confirm from "./confirm/index";
import Document from "./document/index";
import Pay from "./pay/index";
import PayComplete from "./pay/Complete";
import { DisasterHouseProvider } from "../../../context/DisasterHouseContext";
import { SessionProvider } from "../../../context/SessionContext";

const DisasterHouseRouter = () => {
  useScrollToTop();

  return (
    <SessionProvider>
      <DisasterHouseProvider>
        <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/address" element={<Address />} />
        <Route path="/address/search" element={<AddressSearch />} />
        <Route path="/address/dong" element={<DongSelector />} />
        <Route path="/address/floor" element={<FloorSelector />} />
        <Route path="/address/result" element={<ResultDisplay />} />
        <Route path="/insuranceDate" element={<InsuranceDate />} />
        <Route path="/price" element={<Price />} />
        <Route path="/limitAnnounce" element={<LimitsAnnounce />} />
        <Route path="/agreement" element={<ConsentAgreement />} />
        <Route path="/personalInfoConsent" element={<PersonalInfoConsent />} />
        <Route path="/signupChkConsent" element={<SignupChkConsent />} />
        <Route path="/userInfo" element={<UserInfo />} />
        <Route path="/userInfo/business" element={<BusinessInfo />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/document" element={<Document />} />
        <Route path="/pay" element={<Pay />} />
        <Route path="/pay/complete/:tid" element={<PayComplete />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      </DisasterHouseProvider>
    </SessionProvider>
  );
};

export default DisasterHouseRouter;
