import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../../css/disasterSafeguard/floorUnitSelect.module.css";
import SafetyButton from "../../../../components/buttons/SafetyButton";
import FloorList from "../../components/FloorList";
import UnitList from "../../components/UnitList";
import { useFloorUnitSelect } from "../../hooks/useFloorUnitSelect";
import { useDisasterHouse } from "../../../../context/DisasterHouseContext";
import Loading from "../../../../components/loadings/Loading";
import DisasterHeader from "../../../../components/headers/DisasterHeader";

function FloorSelector() {
  const navigate = useNavigate();
  const { buildingData, facilityData, updateFacilityData } = useDisasterHouse();

  // 커스텀 훅을 통해 로직 분리 (Context 데이터 전달)
  const {
    loading,

    // 층 관련
    selectedFloor,
    setSelectedFloor,
    floorSearchText,
    filteredFloors,
    handleFloorSearch,

    // 호실 관련
    selectedUnits,
    setSelectedUnits,
    unitSearchText,
    filteredUnits,
    handleUnitSearch,
    handleUnitSelect,
    fetchUnitsForDong,
    fetchAreasForSelectedUnits,

    // 화면 상태
    currentStep,
    setCurrentStep,

    // 추가된 상태와 함수들
    selectedFloorUnits,
    removeFloorUnit,
  } = useFloorUnitSelect({ buildingData, facilityData });

  // 층 선택 핸들러 (단일 선택)
  const handleFloorSelect = (floor) => {
    setSelectedFloor(floor);
  };

  // 층 선택 완료 - 호실 선택으로 이동 또는 Result로 이동
  const handleFloorSelectionComplete = () => {
    if (!selectedFloor) {
      return;
    }

    // 데이터 기반으로 호수 정보 유무 확인
    const hasUnits = selectedFloor.exposes && selectedFloor.exposes.length > 0;

    // 호수 정보가 없는 경우 바로 Result로 이동
    if (!hasUnits) {
      updateFacilityData({
        selectedFloorUnits: [{
          floor: selectedFloor,
          dong: facilityData?.selectedDong || "",
          units: []
        }],
        unitCount: 1  // 호실 정보가 없는 경우 (단독주택 등) 1세대로 처리
      });

      navigate("/address/result");
      return;
    }

    // 호수 정보가 있는 경우 호실 선택으로 이동
    fetchUnitsForDong(selectedFloor, facilityData.selectedDong);
  };

  // 호실 선택 완료 - 면적 API 호출 후 결과 페이지로 이동
  const handleUnitSelectionComplete = async () => {
    if (selectedUnits.length === 0 && selectedFloorUnits.length === 0) {
      return;
    }

    try {
      // 면적 API 일괄 호출 (buildingCost 포함)
      const { unitsWithArea, buildingCost } = await fetchAreasForSelectedUnits();

      const finalSelectedUnits = [{
        floor: selectedFloor,
        dong: facilityData.selectedDong || "",
        units: unitsWithArea,
      }];

      // 선택된 호실 수 계산 (가입세대수)
      const totalUnitCount = unitsWithArea.length;

      updateFacilityData({
        selectedFloorUnits: finalSelectedUnits,
        unitCount: totalUnitCount,
        buildingCost: buildingCost
      });

      navigate("/address/result");
    } catch (error) {
      console.error('호수 선택 완료 실패:', error);
      alert('면적 조회에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 호실 선택 화면에서 층 선택 화면으로 돌아가기
  const handleBackToPreviousStep = () => {
    setCurrentStep("floor");
    setSelectedUnits([]);
  };

  // 헤더 뒤로가기 버튼 핸들러
  const handleHeaderBack = () => {
    switch (currentStep) {
      case "floor":
        // 층 선택 화면: 동이 있으면 동 선택 페이지로, 없으면 주소 검색으로
        if (facilityData?.selectedDong) {
          navigate("/address/dong");
        } else {
          navigate("/address/search");
        }
        break;
      case "unit":
        // 호실 선택 화면: 층 선택 화면으로
        handleBackToPreviousStep();
        break;
      default:
        navigate("/address/search");
    }
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case "floor":
        return (
          <FloorList
            floorSearchText={floorSearchText}
            handleFloorSearch={handleFloorSearch}
            filteredFloors={filteredFloors}
            selectedFloor={selectedFloor}
            selectedFloors={[]} // 단일 선택 모드이므로 빈 배열
            onFloorSelect={handleFloorSelect}
            loading={loading}
            selectedFloorUnits={selectedFloorUnits}
            removeFloorUnit={removeFloorUnit}
            isSingleFloorMode={true}
          />
        );
      case "unit":
        return (
          <UnitList
            unitSearchText={unitSearchText}
            handleUnitSearch={handleUnitSearch}
            filteredUnits={filteredUnits}
            selectedUnits={selectedUnits}
            onUnitSelect={handleUnitSelect}
            onBack={handleBackToPreviousStep}
            loading={loading}
            selectedFloorUnits={selectedFloorUnits}
            isSingleFloorMode={true}
            currentFloor={selectedFloor}
            currentDong={facilityData?.selectedDong}
          />
        );
      default:
        return (
          <FloorList
            floorSearchText={floorSearchText}
            handleFloorSearch={handleFloorSearch}
            filteredFloors={filteredFloors}
            selectedFloor={selectedFloor}
            selectedFloors={[]}
            onFloorSelect={handleFloorSelect}
            loading={loading}
            selectedFloorUnits={selectedFloorUnits}
            removeFloorUnit={removeFloorUnit}
            isSingleFloorMode={true}
          />
        );
    }
  };

  const getButtonText = () => {
    switch (currentStep) {
      case "floor":
        return selectedFloor ? "층을 선택했어요" : "층을 선택해주세요";
      case "unit":
        return selectedUnits.length > 0 || selectedFloorUnits.length > 0
          ? "호수를 선택했어요"
          : "호수를 선택해주세요";
      default:
        return "다음으로";
    }
  };

  const handleButtonClick = () => {
    switch (currentStep) {
      case "floor":
        return handleFloorSelectionComplete();
      case "unit":
        return handleUnitSelectionComplete();
      default:
        return;
    }
  };

  const isButtonDisabled = () => {
    switch (currentStep) {
      case "floor":
        return !selectedFloor;
      case "unit":
        return selectedUnits.length === 0 && selectedFloorUnits.length === 0;
      default:
        return true;
    }
  };

  return (
    <>
      <DisasterHeader
        title="실손보상 주택 풍수해·지진재해보험"
        onBack={handleHeaderBack}
      />
      {loading && <Loading />}

      <div id={styles.container}>
        {renderCurrentStep()}

        <SafetyButton
          buttonText={getButtonText()}
          onClick={handleButtonClick}
          disabled={isButtonDisabled()}
        />
      </div>
    </>
  );
}

export default FloorSelector;
