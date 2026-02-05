// src/config/partners.js

// URL 경로에서 파트너 ID 추출 - 동적 ID 지원
export const getPartnerCodeFromPath = () => {
  if (typeof window === "undefined") return "testb2b";

  const path = window.location.pathname;
  const hostname = window.location.hostname;

  // b2b.retrust.world 도메인에서 파트너 코드 추출
  if (hostname === "b2b.retrust.world" || hostname === "b2b-dev.retrust.world" || hostname === "b2b-stage.retrust.world") {
    const partnerMatch = path.match(/^\/([^\/]+)/);
    if (partnerMatch && partnerMatch[1]) {
      return partnerMatch[1];
    }
  }

  return "testb2b";
};
