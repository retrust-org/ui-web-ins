import { createAppEntry } from "./appEntryFactory";
import PartnerRouter from "./apps/partner/Router"; // 생성 필요
import { getPartnerCodeFromPath } from "./config/partners";
import { isB2BDomain } from "./config/domains";

// Partner 전용 basename 설정
const getBasename = () => {
  if (typeof window === "undefined") return "";

  const hostname = window.location.hostname;
  const path = window.location.pathname;
  const partnerCode = getPartnerCodeFromPath();

  // 정적 파일 경로 처리는 basename 없이
  if (path.includes("/static/")) return "";

  // B2B 도메인에서의 파트너 경로 처리
  if (isB2BDomain(hostname)) {
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