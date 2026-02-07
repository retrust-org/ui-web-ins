import { createAppEntry } from "./appEntryFactory";
import DomesticRouter from "./apps/trip/domestic/Router";
import { getPartnerCodeFromPath } from "./config/partners";
import { isB2BDomain } from "./config/domains";

// Domestic 전용 basename 설정
const getBasename = () => {
  if (typeof window === "undefined") return "";

  const hostname = window.location.hostname;
  const path = window.location.pathname;
  const partnerCode = getPartnerCodeFromPath();

  // 정적 파일 경로 처리는 basename 없이
  if (path.includes("/static/")) return "";

  // 도메인별 경로 처리
  if (isB2BDomain(hostname)) return `/${partnerCode}/domestic`;

  return "/trip/domestic";
};

createAppEntry({
  Router: DomesticRouter,
  getBasename,
  usePartnerContext: true,
  useReOrderContext: true,
  appName: "Domestic",
  productCd: process.env.REACT_APP_PRODUCT_CD,
});
