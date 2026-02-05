import React from "react";
import { Route, Routes } from "react-router-dom";

// Shared
import NotFoundPage from "../../components/NotFoundPage";
import useScrollToTop from "../..//hooks/useNavigateWithScrollToTop";
import PrivateRoute from "../claim/hooks/PrivateRoute";
import IndividualInfo from "../../components/footer/IndividualInfo";
import ServiceInfo from "../../components/footer/ServiceAnnounce";

// 청구업로드 Context
import { ClaimUploadProvider } from "../../context/ClaimUploadContext";

// Pages
import ClaimRequiredDoc from "../claim/claims/ClaimRquiredDoc";
import ClaimIntro from "../claim/auth/index";
import ClaimIntroFull from "../claim/auth/ClaimIntroFull";
import ClaimReferral from "../claim/gift/ClaimReferral";
import Home from "../home/index"; // Home 컴포넌트 추가
import ClaimRevocation from "../claim/cancel/ClaimRevocation";
import ClaimEntryAndAgreement from "../claim/claims/ClaimEntryAndAgreement";
import ClaimDocuments from "../claim/claims/ClaimDocuments";
import ClaimConfirm from "../claim/confirm/ClaimConfirm";
import PaymentStatement from "../claim/confirm/PaymentStatement";
import ClaimContractInfo from "../claim/contract/ClaimContractInfo";
import ClaimContractDetail from "../claim/contract/ClaimContractDetail";
import ClaimRevocationDetail from "../claim/cancel/ClaimRevocationDetail";
import ClaimCombine from "../claim/auth/ClaimCombine";
import ClaimRevocationAll from "../claim/cancel/ClaimRevocationAll";
import ClaimExtendDate from "../claim/extend/ClaimExtendDate";
import ClaimExtendDateDetails from "../claim/extend/ClaimExtendDateDetails";
import ClaimMemberIntro from "../claim/claims/ClaimMemberIntro";
import ClaimExtendSelectDate from "../claim/extend/ClaimExtendSelectDate";
import ClaimExtendCostChk from "../claim/extend/ClaimExtendCostChk";
import EmergencySupport from "../claim/main/EmergencySupport";
import ClaimReferralDetail from "../claim/gift/ClaimReferralDetail";
import ClaimLogin from "../claim/auth/ClaimLogin";
// import ClaimMain from "../claim/main/index";
import ClaimFAQ from "../claim/main/ClaimFAQ";
import ClaimPolicy from "../claim/main/ClaimPolicy";
import ClaimSelectDate from "./claims/ClaimSelectDate";
import InsuredpeopleInfo from "./claims/InsuredpeopleInfo";
import AccidentAccept from "./claims/AccidentAccept";
import ClaimTypeSelecte from "./claims/ClaimTypeSelecte";
import ClaimAnnounce from "./claims/ClaimAnnounce";
import Disease from "./components/ClaimAnnounceDetail/Disease";
import Wound from "./components/ClaimAnnounceDetail/Wound";
import Liability from "./components/ClaimAnnounceDetail/Liability";
import Overseas from "./components/ClaimAnnounceDetail/Overseas";
import ClaimDocumentSend from "./claims/ClaimDocumentSend";
import { ClaimTableButtonProvider } from "../../context/ClaimsNavigateContext";
import ReceptionistInfo from "./claims/ReceptionistInfo";

const Router = () => {
  useScrollToTop();

  return (
    <ClaimTableButtonProvider>
      <ClaimUploadProvider>
        <Routes>
          {/* 루트 경로에 홈 페이지 추가 (개발용) */}
          <Route path="/" element={<Home />} />
          {/* <Route path="/" element={<PrivateRoute element={<ClaimMain />} />} /> */}
          {/* 인증관련 */}
          <Route path="/login" element={<ClaimIntro />} />
          <Route path="/login-full" element={<ClaimIntroFull />} />
          <Route path="/claimFAQ" element={<ClaimFAQ />} />
          <Route path="/policy" element={<ClaimPolicy />} />
          <Route path="/claimLogin" element={<ClaimLogin />} />
          {/* EmergencySupport와 관련된 Combine 페이지만 유지 */}
          <Route
            path="/combine"
            element={<PrivateRoute element={<ClaimCombine />} />}
          />
          {/* 인증관련 */}
          {/* 선물하기 */}
          <Route
            path="/claimReferral"
            element={<PrivateRoute element={<ClaimReferral />} />}
          />
          <Route
            path="/claimReferral/:card_id"
            element={<PrivateRoute element={<ClaimReferralDetail />} />}
          />
          {/* 선물하기 */}
          {/* 청구삭제,철회 */}
          <Route
            path="/claimRevocation"
            element={<PrivateRoute element={<ClaimRevocation />} />}
          />
          <Route
            path="/claimRevocationAll"
            element={<PrivateRoute element={<ClaimRevocationAll />} />}
          />
          <Route
            path="/claimRevocation/:id"
            element={<PrivateRoute element={<ClaimRevocationDetail />} />}
          />
          {/* 청구삭제,철회 */}
          {/* 청구확인 및 조회 */}
          <Route
            path="/claimContractInfo"
            element={<PrivateRoute element={<ClaimContractInfo />} />}
          />
          <Route
            path="/claimContractInfo/:id"
            element={<PrivateRoute element={<ClaimContractDetail />} />}
          />
          <Route
            path="/claimDocuments"
            element={<PrivateRoute element={<ClaimDocuments />} />}
          />
          <Route
            path="/required"
            element={<PrivateRoute element={<ClaimRequiredDoc />} />}
          />
          <Route
            path="/claimConfirm"
            element={<PrivateRoute element={<ClaimConfirm />} />}
          />
          <Route
            path="/claimPaymentStatement/:clmId"
            element={<PrivateRoute element={<PaymentStatement />} />}
          />
          {/* 청구확인 및 조회 */}
          {/* 청구안내 및 청구 업로드 */}
          <Route path="/claimMembersIntro" element={<ClaimMemberIntro />} />
          <Route path="/receptioninfo" element={<ReceptionistInfo />} />
          <Route
            path="/claimSelectDate"
            element={<PrivateRoute element={<ClaimSelectDate />} />}
          />
          <Route path="/claimAgree" element={<ClaimEntryAndAgreement />} />
          <Route
            path="/insuredpeopleInfo"
            element={<PrivateRoute element={<InsuredpeopleInfo />} />}
          />

          <Route
            path="/claimTypeSelect"
            element={<PrivateRoute element={<ClaimTypeSelecte />} />}
          />
          <Route
            path="/accidentAccept"
            element={<PrivateRoute element={<AccidentAccept />} />}
          />
          <Route
            path="/claimAnnounce"
            element={<PrivateRoute element={<ClaimAnnounce />} />}
          />
          <Route
            path="/claimAnnounce/disease"
            element={<PrivateRoute element={<Disease />} />}
          />
          <Route
            path="/claimAnnounce/wound"
            element={<PrivateRoute element={<Wound />} />}
          />
          <Route
            path="/claimAnnounce/liability"
            element={<PrivateRoute element={<Liability />} />}
          />
          <Route
            path="/claimAnnounce/overseas"
            element={<PrivateRoute element={<Overseas />} />}
          />
          <Route path="/claimDocSend" element={<ClaimDocumentSend />} />
          {/* 청구안내 및 청구청구업로드 */}
          {/* 도착일 연장 */}
          <Route
            path="/claimExtendDate"
            element={<PrivateRoute element={<ClaimExtendDate />} />}
          />
          <Route
            path="/claimExtendDate/:moid"
            element={<PrivateRoute element={<ClaimExtendDateDetails />} />}
          />
          <Route
            path="/claimExtendSelectDate"
            element={<PrivateRoute element={<ClaimExtendSelectDate />} />}
          />
          <Route
            path="/claimExtendCostChk"
            element={<PrivateRoute element={<ClaimExtendCostChk />} />}
          />
          {/* 도착일 연장 */}
          {/* 푸터 및 404 , 고객센터 */}
          <Route path="/individualInfo" element={<IndividualInfo />} />
          <Route path="/serviceInfo" element={<ServiceInfo />} />
          <Route path="*" element={<NotFoundPage />} />
          <Route path="/emergencySupport" element={<EmergencySupport />} />
          {/* 푸터 및 404 */}
        </Routes>
      </ClaimUploadProvider>
    </ClaimTableButtonProvider>
  );
};

export default Router;
