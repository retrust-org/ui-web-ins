import { createAppEntry } from "./appEntryFactory";
import OverseasRouter from "./apps/trip/overseas/Router";
import { getPartnerCodeFromPath } from "./config/partners";
import { isB2BDomain } from "./config/domains";

// Overseas 전용 basename 설정
const getBasename = () => {
  if (typeof window === "undefined") return "";

  const hostname = window.location.hostname;
  const path = window.location.pathname;
  const partnerCode = getPartnerCodeFromPath();

  // 정적 파일 경로 처리는 basename 없이
  if (path.includes("/static/")) return "";

  // 도메인별 경로 처리
  if (isB2BDomain(hostname)) return `/${partnerCode}/overseas`;

  // 기타 경로 처리
  if (path.startsWith("/partner/overseas")) return "/partner/overseas";
  if (path.startsWith("/overseas")) return "/overseas";

  return "/trip/overseas";
};

createAppEntry({
  Router: OverseasRouter,
  getBasename,
  usePartnerContext: true,
  useReOrderContext: true,
  appName: "Overseas",
  productCd: process.env.REACT_APP_PRODUCT_CD,
});
