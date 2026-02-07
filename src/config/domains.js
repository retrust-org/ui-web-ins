// src/config/domains.js

// B2B 도메인 기본 목록
const DEFAULT_B2B_DOMAINS = [
  "b2b.retrust.world",
  "b2b-dev.retrust.world",
  "b2b-stage.retrust.world",
  "dev.b2b.retrust.world",
];

// REACT_APP_B2B_DOMAINS 환경변수로 오버라이드 가능 (빌드 시 주입, 콤마 구분)
const B2B_DOMAINS = process.env.REACT_APP_B2B_DOMAINS
  ? process.env.REACT_APP_B2B_DOMAINS.split(",").map((d) => d.trim())
  : DEFAULT_B2B_DOMAINS;

/**
 * 현재 호스트네임이 B2B 도메인인지 확인
 * @param {string} hostname - 확인할 호스트네임 (생략 시 window.location.hostname 사용)
 * @returns {boolean} B2B 도메인이면 true, 아니면 false
 */
export const isB2BDomain = (hostname) => {
  if (!hostname) hostname = typeof window !== "undefined" ? window.location.hostname : "";
  return B2B_DOMAINS.includes(hostname);
};
