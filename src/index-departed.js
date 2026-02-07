import { createAppEntry } from "./appEntryFactory";
import DepartedRouter from "./apps/trip/departed/Router";
import { getPartnerCodeFromPath } from "./config/partners";
import { isB2BDomain } from "./config/domains";

// Departed 전용 basename 설정
const getBasename = () => {
  if (typeof window === "undefined") return "";

  const hostname = window.location.hostname;
  const path = window.location.pathname;
  const partnerCode = getPartnerCodeFromPath();

  // 정적 파일 경로 처리는 basename 없이
  if (path.includes("/static/")) return "";

  if (isB2BDomain(hostname)) {
    return `/${partnerCode}/departed`;
  }

  return "/trip/departed";
};

createAppEntry({
  Router: DepartedRouter,
  getBasename,
  usePartnerContext: true,
  useReOrderContext: true,
  appName: "Departed",
  productCd: process.env.REACT_APP_PRODUCT_CD,
});
