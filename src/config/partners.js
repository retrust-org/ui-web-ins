// src/config/partners.js
import { isB2BDomain } from "./domains";

// URL 경로에서 파트너 ID 추출 - 동적 ID 지원
export const getPartnerCodeFromPath = () => {
  if (typeof window === "undefined") return "testb2b";

  const path = window.location.pathname;
  const hostname = window.location.hostname;

  // B2B 도메인에서 파트너 코드 추출
  if (isB2BDomain(hostname)) {
    const partnerMatch = path.match(/^\/([^\/]+)/);
    if (partnerMatch && partnerMatch[1]) {
      return partnerMatch[1];
    }
  }

  return "testb2b";
};
