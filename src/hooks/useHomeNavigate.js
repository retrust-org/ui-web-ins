import { usePartner } from "./usePartner";
import { isB2BDomain } from "../config/domains";

export const useHomeNavigate = () => {
  // Hook을 최상위에서 호출
  const { partnerConfig } = usePartner() || {};

  const navigateToHome = () => {
    const hostname = window.location.hostname;

    // B2B 도메인인지 확인
    if (isB2BDomain(hostname)) {
      let partnerCode = null;

      // 1. window.basename에서 파트너 코드 추출
      if (window.basename) {
        const pathParts = window.basename.split('/').filter(part => part);
        if (pathParts.length > 0) {
          partnerCode = pathParts[0]; // '/pinkb2b/claim' -> 'pinkb2b'
        }
      }

      // 2. basename이 없으면 partnerConfig에서 가져오기
      if (!partnerCode && partnerConfig?.partner_cd) {
        partnerCode = partnerConfig.partner_cd;
      }

      // 파트너 코드가 있으면 해당 파트너 페이지로 이동
      if (partnerCode) {
        window.location.href = `${window.location.origin}/${partnerCode}`;
        return;
      }

      // 파트너 코드를 찾을 수 없는 경우 root로 이동 (403 발생)
      window.location.href = window.location.origin;
    } else {
      // 다른 도메인에서는 기존 동작 유지
      window.location.href = window.location.origin || "";
    }
  };

  return { navigateToHome };
};