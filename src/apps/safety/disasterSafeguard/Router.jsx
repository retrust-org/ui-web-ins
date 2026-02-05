import React, { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import useScrollToTop from "../../../hooks/useNavigateWithScrollToTop";
import Main from "./main/index";
import NotFoundPage from "../../../components/NotFoundPage";
import Address from "./address/index";
import AddressSearch from "./address/AddressSearch";
import BuildingTypeSelector from "./address/BuildingTypeSelector";
import DongSelector from "./address/DongSelector";
import FloorSelector from "./address/FloorSelector";
import ResultDisplay from "./address/ResultDisplay";
import CollectAgree from "./address/CollectAgree";
import ProvideAgree from "./address/ProvideAgree";
import Information from "./workplace/Information";
import Selectedprice from "./selectedprice/index";
import LimitsAnnounce from "./consentform/LimitsAnnounce";
import ConsentAgreement from "./consentform/ConsentAgreement";
import PersonalInfoConsent from "./consentform/PersonalInfoConsent";
import SignupChkConsent from "./consentform/SignupChkConsent";
import UserInfo from "./userinfo/index";
import InsuranceDate from "./insuranceDate/index";
import Confirm from "./confirm/index";
import Document from "./document/index";
import Pay from "./pay/index";
import PayComplete from "./pay/Complete";
import { DisasterInsuranceProvider } from "../../../context/DisasterInsuranceContext";
import { SessionProvider } from "../../../context/SessionContext";
import csrfManager from "../../../utils/csrfTokenManager";

const SafeguardRouter = () => {
  useScrollToTop();

  // CSRF 토큰 초기화 (앱 마운트 시 한 번만 실행)
  useEffect(() => {
    csrfManager.initialize();
  }, []);

  return (
    <SessionProvider>
      <DisasterInsuranceProvider>
        <Routes>
        <Route path="/" element={<Main />} />
        <Route path="/address" element={<Address />} />
        <Route path="/addressSearch" element={<AddressSearch />} />
        <Route path="/buildingType" element={<BuildingTypeSelector />} />
        <Route path="/dong" element={<DongSelector />} />
        <Route path="/floor" element={<FloorSelector />} />
        <Route path="/result" element={<ResultDisplay />} />
        <Route path="/collectAgree" element={<CollectAgree />} />
        <Route path="/provideAgree" element={<ProvideAgree />} />
        <Route path="/workPlaceinfo" element={<Information />} />
        <Route path="/price" element={<Selectedprice />} />
        <Route path="/limitAnnounce" element={<LimitsAnnounce />} />
        <Route path="/agreement" element={<ConsentAgreement />} />
        <Route path="/personalInfoConsent" element={<PersonalInfoConsent />} />
        <Route path="/signupChkConsent" element={<SignupChkConsent />} />
        <Route path="/userInfo" element={<UserInfo />} />
        <Route path="/insuranceDate" element={<InsuranceDate />} />
        <Route path="/confirm" element={<Confirm />} />
        <Route path="/document" element={<Document />} />
        <Route path="/pay" element={<Pay />} />
        <Route path="/pay/complete/:tid" element={<PayComplete />} />

        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </DisasterInsuranceProvider>
    </SessionProvider>
  );
};

export default SafeguardRouter;
