import { useState, useEffect } from "react";

export const useBuildingData = (initialData) => {
  const [buildingData, setBuildingData] = useState(null);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // location.state에서 전달된 데이터 확인
    if (initialData) {
      const { buildingData, selectedAddress } = initialData;
      setBuildingData(buildingData);
      setSelectedAddress(selectedAddress);
    }
  }, [initialData]);

  // building-units API 호출 헬퍼 함수
  // 건물의 동/호수/층 정보를 반환
  // - 집합건물 (아파트, 오피스텔, 상가 등 - regstrGbCdNm: "집합"): 상세 호실 정보 반환
  // - 단독주택 (regstrGbCdNm: "일반", mainPurpsCdNm: "단독주택"): 빈 배열 반환 (호실 정보 없음)
  const fetchBuildingUnits = async (sigunguCd, bjdongCd, bun, ji) => {
    setLoading(true);
    try {
      const unitsUrl = `${process.env.REACT_APP_BASE_URL}/trip-api/api/v2/disaster/building-units?sigunguCd=${sigunguCd}&bjdongCd=${bjdongCd}&bun=${bun}&ji=${ji}`;

      const response = await fetch(unitsUrl);
      const data = await response.json();

      // errCd 체크 - "00001"이 아니면 에러
      if (data.errCd && data.errCd !== "00001") {
        throw new Error(data.errMsg || "건물 정보를 불러오는데 실패했습니다.");
      }

      return data;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    buildingData,
    selectedAddress,
    setBuildingData,
    setSelectedAddress,
    loading,
    fetchBuildingUnits,
  };
};
