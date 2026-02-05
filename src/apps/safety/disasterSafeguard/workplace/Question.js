import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WorkSpaceModal from "../../components/WorkSpaceModal";
import { useDisasterInsurance } from "../../../../context/DisasterInsuranceContext";
import { useSessionState } from "../../hooks/useSessionState";

function Question({ areaResult, isOpen, onClose }) {
  const navigate = useNavigate();
  const { facilityData, updateFacilityData } = useDisasterInsurance();

  const [currentModal, setCurrentModal] = useState(1);

  // sessionStorage에서 복원
  const [facilityType, setFacilityType] = useSessionState(facilityData.sfdgFclTpCd, "");
  const [ownershipType, setOwnershipType] = useSessionState(facilityData.owsDivCon, "");
  const [businessType, setBusinessType] = useSessionState(facilityData.polhdCusTpCd, "");

  // 모달이 닫힐 때 상태 초기화
  useEffect(() => {
    if (!isOpen) {
      resetStates();
    }
  }, [isOpen]);

  // 모든 상태값 초기화 함수
  const resetStates = () => {
    setCurrentModal(1);
    setFacilityType("");
    setOwnershipType("");
    setBusinessType("");
  };

  // 전통시장 여부 선택 시 실행
  const handleMarketSelection = (isTraditionalMarket) => {
    const isWholeBuildingType = ["total", "all-buildings"].includes(facilityData.selectedBuildingType);

    // 선택된 층 중 지하층 또는 지상1층이 포함되어 있는지 확인
    const hasBasementOrFirst = facilityData.selectedFloorUnits.some(item => {
      const flrGbCd = item.floor.flrGbCdNm === "지하" ? "10" : "20";
      const flrNo = parseInt(item.floor.flrNo);

      // flrGbCd와 flrNo를 조합하여 판단
      const isBasement = flrGbCd === "10"; // 지하층 (층수 무관)
      const isGroundFirst = flrGbCd === "20" && flrNo === 1; // 지상 1층

      return isBasement || isGroundFirst;
    });

    // sfdgFclTpCd 결정: "01"(전통시장) / "02"(지하·1층) / "03"(2층이상)
    const determinedType = isTraditionalMarket ? "01" : (isWholeBuildingType || hasBasementOrFirst) ? "02" : "03";

    console.log("=== sfdgFclTpCd 판단 로그 ===");
    console.log("전통시장 여부:", isTraditionalMarket);
    console.log("건물 타입:", facilityData.selectedBuildingType);
    console.log("전체 건물 여부:", isWholeBuildingType);
    console.log("선택된 층 상세:");
    facilityData.selectedFloorUnits.forEach(item => {
      const flrGbCd = item.floor.flrGbCdNm === "지하" ? "10" : "20";
      const flrNo = parseInt(item.floor.flrNo);
      console.log(`  - flrGbCdNm: ${item.floor.flrGbCdNm}, flrGbCd: ${flrGbCd}, flrNo: ${flrNo}`);
      console.log(`    → 지하층: ${flrGbCd === "10"}, 지상1층: ${flrGbCd === "20" && flrNo === 1}`);
    });
    console.log("지하층/1층 포함 여부:", hasBasementOrFirst);
    console.log("최종 sfdgFclTpCd:", determinedType);
    console.log("===========================");

    setFacilityType(determinedType);
    setCurrentModal(2);
  };

  // 소유 여부 선택 시 실행
  const handleOwnershipSelection = (isOwner) => {
    setOwnershipType(isOwner ? "소유자" : "임차자");
    setCurrentModal(3);
  };

  // 사업자 구분 선택 시 실행
  const handleBusinessTypeSelection = (selectedType) => {
    const businessTypeValue = selectedType === "personal" ? "2" : "3";
    setBusinessType(businessTypeValue);
    finishSelections(businessTypeValue);
  };

  // 모든 선택 완료 후 Context에 데이터 저장 및 모달 닫기
  const finishSelections = (businessTypeValue) => {
    // area 계산: areaResult에서 가져오거나 기존 facilityData.area 사용
    let calculatedArea = facilityData.area || null; // 기존 값을 기본값으로 사용

    // areaResult가 있으면 우선 사용 (floor 선택 시)
    if (areaResult && areaResult.length > 0) {
      const areaFromResult = areaResult[0]?.response?.body?.items?.item?.[0]?.area;
      if (areaFromResult) {
        calculatedArea = areaFromResult;
      }
    }

    const updatedFacilityData = {
      sfdgFclTpCd: facilityType,
      owsDivCon: ownershipType,
      polhdCusTpCd: businessTypeValue || businessType,
      area: calculatedArea,
    };

    // Context에 데이터 저장
    updateFacilityData(updatedFacilityData);

    onClose();
    resetStates();

    // workPlaceInfo 페이지로 이동 (Context 사용하므로 state 불필요)
    navigate("/workPlaceInfo");
  };

  // 모달 외부 영역 클릭 시 모달 닫기
  const handleOutsideClick = () => {
    onClose();
    resetStates();
  };

  if (!isOpen) return null;

  return (
    <>
      {currentModal === 1 && (
        <WorkSpaceModal
          title="사업장이 전통시장인가요?"
          subTitle=""
          primaryBtnText="아니오"
          secondaryBtnText="네"
          primaryBtnOnClick={() => handleMarketSelection(false)}
          secondaryBtnOnClick={() => handleMarketSelection(true)}
          onClose={handleOutsideClick}
        />
      )}

      {currentModal === 2 && (
        <WorkSpaceModal
          title="사업장 소유여부"
          subTitle="보장내용이 달라지니 잘 확인해주세요"
          primaryBtnText="소유자"
          secondaryBtnText="임차인(전월세)"
          primaryBtnOnClick={() => handleOwnershipSelection(true)}
          secondaryBtnOnClick={() => handleOwnershipSelection(false)}
          onClose={handleOutsideClick}
        />
      )}

      {currentModal === 3 && (
        <WorkSpaceModal
          title="사업자 구분"
          subTitle="보장내용이 달라지니 확인해주세요!"
          primaryBtnText="개인사업자"
          secondaryBtnText="법인사업자"
          primaryBtnOnClick={() => handleBusinessTypeSelection("personal")}
          secondaryBtnOnClick={() => handleBusinessTypeSelection("corporate")}
          onClose={handleOutsideClick}
        />
      )}
    </>
  );
}

export default Question;
