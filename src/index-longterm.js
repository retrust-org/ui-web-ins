import { createAppEntry } from "./appEntryFactory";
import LongTermRouter from "./apps/trip/longterm/Router";
import { getPartnerCodeFromPath } from "./config/partners";

// LongTerm 전용 basename 설정
const getBasename = () => {
  if (typeof window === "undefined") return "";

  const hostname = window.location.hostname;
  const path = window.location.pathname;
  const partnerCode = getPartnerCodeFromPath();

  // 정적 파일 경로 처리는 basename 없이
  if (path.includes("/static/")) return "";

  if (hostname === "b2b.retrust.world" || hostname === "b2b-dev.retrust.world" || hostname === "b2b-stage.retrust.world") {
    return `/${partnerCode}/longterm`;
  }

  return "/trip/longterm";
};

createAppEntry({
  Router: LongTermRouter,
  getBasename,
  usePartnerContext: true,
  useReOrderContext: true,
  appName: "LongTerm",
  productCd: process.env.REACT_APP_PRODUCT_CD,
});
