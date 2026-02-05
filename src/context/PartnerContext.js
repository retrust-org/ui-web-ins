// src/contexts/PartnerContext.js
import React, { createContext, useState, useEffect } from "react";

// 파트너 컨텍스트 생성
export const PartnerContext = createContext();

// 현재 도메인이 b2b.retrust.world인지 확인하는 함수
const isB2BDomain = () => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return hostname === "b2b.retrust.world" || hostname === "b2b-dev.retrust.world";
};

// URL 경로에서 파트너 ID 추출 함수 (b2b 도메인 체크 추가)
const getPartnerCodeFromPath = () => {
  if (typeof window === "undefined") return "testb2b";

  const path = window.location.pathname;
  const hostname = window.location.hostname;

  // b2b.retrust.world 도메인에서만 파트너 코드 추출
  if (hostname === "b2b.retrust.world" || hostname === "b2b-dev.retrust.world") {
    const partnerMatch = path.match(/^\/([^\/]+)/);
    if (partnerMatch && partnerMatch[1]) {
      return partnerMatch[1];
    }
    return "testb2b";
  }

  // b2b 도메인이 아닌 경우 null 반환 (파트너 기능 비활성화)
  return null;
};

// 파트너 컨텍스트 제공자 컴포넌트
export const PartnerProvider = ({ children }) => {
  const [isB2B, setIsB2B] = useState(isB2BDomain());
  const [partnerId, setPartnerId] = useState(getPartnerCodeFromPath());
  const [partnerConfig, setPartnerConfig] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 파트너 설정 로드 함수 (B2B 도메인 체크 추가)
  const loadPartnerConfig = async (id) => {
    // 파트너 ID가 없거나 B2B 도메인이 아니면 로드하지 않음
    if (!id || !isB2B) {
      setLoading(false);
      setPartnerConfig(null);
      return null;
    }

    try {
      setLoading(true);
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/trip-api/api/auth/service/${id}`
      );

      if (!response.ok) {
        throw new Error(
          `파트너 데이터를 가져올 수 없습니다 (상태: ${response.status})`
        );
      }

      const data = await response.json();

      setPartnerConfig(data);
      setError(null);
      return data;
    } catch (error) {
      console.error("파트너 데이터 가져오기 오류:", error);
      setError(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // 도메인 변경 감지 (SPA에서 도메인 변경은 드물지만 안전을 위해 포함)
  useEffect(() => {
    const checkDomain = () => {
      const newIsB2B = isB2BDomain();
      if (newIsB2B !== isB2B) {
        setIsB2B(newIsB2B);
        // 도메인이 변경되었을 때 파트너 ID 재설정
        setPartnerId(getPartnerCodeFromPath());
      }
    };

    // 초기 체크
    checkDomain();

    // 페이지 로드/새로고침 시 체크
    window.addEventListener("load", checkDomain);

    return () => {
      window.removeEventListener("load", checkDomain);
    };
  }, [isB2B]);

  // URL이 변경될 때 파트너 ID 업데이트 (B2B 도메인인 경우만)
  useEffect(() => {
    if (!isB2B) return; // B2B 도메인이 아니면 무시

    const handleLocationChange = () => {
      const newPartnerId = getPartnerCodeFromPath();
      if (newPartnerId !== partnerId) {
        setPartnerId(newPartnerId);
      }
    };

    // 히스토리 변경 감지
    window.addEventListener("popstate", handleLocationChange);

    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, [isB2B, partnerId]);

  // 파트너 ID가 변경될 때 설정 로드 (B2B 도메인인 경우만)
  useEffect(() => {
    if (isB2B && partnerId) {
      loadPartnerConfig(partnerId);
    } else {
      // B2B 도메인이 아니거나 파트너 ID가 없는 경우 데이터 초기화
      setPartnerConfig(null);
      setLoading(false);
      setError(null);
    }
  }, [isB2B, partnerId]);

  // 컨텍스트 값
  const value = {
    isB2B,
    partnerId,
    partnerConfig,
    loading,
    error,
    refreshPartnerConfig: () =>
      isB2B && partnerId ? loadPartnerConfig(partnerId) : null,
    setCustomPartnerId: (id) => {
      if (!isB2B) return null; // B2B 도메인이 아니면 무시
      setPartnerId(id);
      return loadPartnerConfig(id);
    },
  };

  return (
    <PartnerContext.Provider value={value}>{children}</PartnerContext.Provider>
  );
};
