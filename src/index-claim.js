import { createAppEntry } from "./appEntryFactory";
import ClaimRouter from "./apps/claim/Router";
import { getPartnerCodeFromPath } from "./config/partners";
import { isB2BDomain } from "./config/domains";

// Claim 전용 basename 설정
const getBasename = () => {

  if (typeof window === "undefined") return "";

  const hostname = window.location.hostname;
  const path = window.location.pathname;

  // 정적 파일 경로 처리는 basename 없이
  if (path.includes("/static/")) return "";

  const partnerCode = getPartnerCodeFromPath();
  // B2B 도메인에서는 /claim 경로 사용
  if (isB2BDomain(hostname)) return `/${partnerCode}/claim`;

  // 다른 도메인에서는 PUBLIC_URL 사용
  return process.env.PUBLIC_URL || "/claim";
};

createAppEntry({
  Router: ClaimRouter,
  getBasename,
  appName: "Claim",
  useAppComponent: false,
  usePartnerContext: true,
});