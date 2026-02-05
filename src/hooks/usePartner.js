// src/hooks/usePartner.js
import { useContext } from "react";
import { PartnerContext } from "../context/PartnerContext";

// 파트너 컨텍스트 사용 훅 - 안전하게 처리
export const usePartner = () => {
  const context = useContext(PartnerContext);

  // context가 undefined인 경우 기본값 제공
  if (!context) {
    return {
      isB2B: false,
      partnerId: null,
      partnerConfig: null,
      loading: false,  // 또는 isLoading: false
      isLoading: false, // 추가: PartnerMain에서 사용하는 이름
      error: null,
      refreshPartnerConfig: () => null,
      setCustomPartnerId: () => null,
    };
  }

  // context가 있는 경우, isLoading도 함께 반환
  return {
    ...context,
    isLoading: context.loading, // loading을 isLoading으로도 제공
  };
};