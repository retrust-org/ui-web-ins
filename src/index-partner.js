import { createAppEntry } from "./appEntryFactory";
import PartnerRouter from "./apps/partner/Router"; // 생성 필요
import { getPartnerCodeFromPath } from "./config/partners";

// Partner 전용 basename 설정
const getBasename = () => {
  if (typeof window === "undefined") return "";

  const hostname = window.location.hostname;
  const path = window.location.pathname;
  const partnerCode = getPartnerCodeFromPath();

  // 정적 파일 경로 처리는 basename 없이
  if (path.includes("/static/")) return "";

  // b2b 도메인에서의 파트너 경로 처리
  if (hostname === "b2b.retrust.world" || hostname === "b2b-dev.retrust.world" || hostname === "b2b-stage.retrust.world") {
    return `/${partnerCode}`;
  }

  // 다른 도메인에서는 PUBLIC_URL 사용
  return process.env.PUBLIC_URL || "";
};

createAppEntry({
  Router: PartnerRouter,
  getBasename,
  usePartnerContext: true,
  useReOrderContext: true,
  appName: "Partner",
});