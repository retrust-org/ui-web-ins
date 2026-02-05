import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../../css/disasterSafeguard/floorUnitSelect.module.css";
import SafetyButton from "../../../../components/buttons/SafetyButton";
import FloorList from "../../components/FloorList";
import UnitList from "../../components/UnitList";
import { useFloorUnitSelect } from "../../hooks/useFloorUnitSelect";
import { useDisasterInsurance } from "../../../../context/DisasterInsuranceContext";
import Loading from "../../../../components/loadings/Loading";
import DisasterHeader from "../../../../components/headers/DisasterHeader";
import { buildingApiService } from "../../services/buildingApiService";

function FloorSelector() {
  const navigate = useNavigate();
  const { buildingData, facilityData, updateFacilityData } = useDisasterInsurance();

  // 단층 모드 확인
  const isSingleFloorMode = facilityData.selectedBuildingType === 'single-floor';

  // 커스텀 훅을 통해 로직 분리 (Context 데이터 전달)
  const {
    loading,

    // 층 관련
    selectedFloor,
    setSelectedFloor,
    selectedFloors, // 여러층 모드용
    setSelectedFloors, // 여러층 모드용
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
    fetchUnitsForMultipleFloors, // 추가
    fetchAreasForSelectedUnits,  // 추가: 면적 API 일괄 호출

    // 화면 상태
    currentStep,
    setCurrentStep,

    // 추가된 상태와 함수들
    selectedFloorUnits,
    addSelectedFloorAndUnits,
    removeFloorUnit,
  } = useFloorUnitSelect({ buildingData, facilityData });

  // 이벤트 핸들러
  const handleFloorSelect = (floor) => {
    if (isSingleFloorMode) {
      // 단층 모드: 단일 선택
      setSelectedFloor(floor);
    } else {
      // 여러층 모드: 다중 선택 (토글)
      setSelectedFloors(prev => {
        const exists = prev.some(f => f.flrNo === floor.flrNo && f.flrGbCdNm === floor.flrGbCdNm);
        if (exists) {
          // 이미 선택된 층이면 제거
          return prev.filter(f => !(f.flrNo === floor.flrNo && f.flrGbCdNm === floor.flrGbCdNm));
        } else {
          // 선택되지 않은 층이면 추가
          return [...prev, floor];
        }
      });
    }
  };

  // 동 선택은 DongSelector에서 처리되므로 불필요

  // '다른 층 추가 하러가기' 버튼 클릭 핸들러
  const handleAddMoreFloors = () => {
    // 현재 선택된 층과 호수를 저장
    addSelectedFloorAndUnits();
  };

  // 층 선택 완료 - 호실 선택으로 이동 또는 Result로 이동
  const handleFloorSelectionComplete = () => {

    // 단층 모드
    if (isSingleFloorMode) {
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
          }]
        });

        navigate("/result");
        return;
      }

      // 호수 정보가 있는 경우 호실 선택으로 이동
      // DongSelector에서 이미 selectedDong이 설정되었다고 가정
      fetchUnitsForDong(selectedFloor, facilityData.selectedDong);
    } else {
      // 여러층 모드
      if (!selectedFloors || selectedFloors.length === 0) {
        return;
      }

      // 모든 선택된 층의 호수 정보 유무 확인
      const hasAnyUnits = selectedFloors.some(floor =>
        floor.exposes && floor.exposes.length > 0
      );

      // 호수 정보가 없는 경우 바로 Result로 이동
      if (!hasAnyUnits) {
        // 선택된 층들을 selectedFloorUnits 형식으로 변환
        const floorUnitsData = selectedFloors.map(floor => ({
          floor: floor,
          dong: facilityData?.selectedDong || "",
          units: []
        }));

        updateFacilityData({
          selectedFloorUnits: floorUnitsData
        });

        navigate("/result");
        return;
      }

      // 호수 정보가 있는 경우 호실 선택으로 이동
      // DongSelector에서 이미 selectedDong이 설정되었다고 가정
      fetchUnitsForMultipleFloors(selectedFloors, facilityData?.selectedDong || null);
    }
  };

  // 동 선택은 DongSelector에서 처리되므로 이 함수는 불필요
  // FloorSelector는 층 선택 → 호실 선택만 담당

  // 호실 선택 완료 - 면적 API 호출 후 결과 페이지로 이동
  const handleUnitSelectionComplete = async () => {
    if (selectedUnits.length === 0 && selectedFloorUnits.length === 0) {
      return;
    }

    try {
      // 면적 API 일괄 호출
      const result = await fetchAreasForSelectedUnits();
      const unitsWithArea = result.unitsWithArea || [];

      // 단층 모드일 때
      if (isSingleFloorMode) {
        const finalSelectedUnits = [{
          floor: selectedFloor,
          dong: facilityData.selectedDong || "",
          units: unitsWithArea,
        }];

        updateFacilityData({
          selectedFloorUnits: finalSelectedUnits
        });

        navigate("/result");
        return;
      }

      // 여러층 모드: 선택된 모든 호수를 층별로 그룹화하여 저장
      if (unitsWithArea.length > 0) {
        // 선택된 호수들을 층별로 그룹화
        const floorUnitsMap = {};

        unitsWithArea.forEach(unit => {
          const floorKey = `${unit.flrGbCdNm}_${unit.flrNo}`;
          if (!floorUnitsMap[floorKey]) {
            floorUnitsMap[floorKey] = {
              floor: {
                flrNo: unit.flrNo,
                flrGbCdNm: unit.flrGbCdNm
              },
              dong: facilityData.selectedDong || unit.dongNm || "",
              units: []
            };
          }
          floorUnitsMap[floorKey].units.push(unit);
        });

        // Map을 배열로 변환
        const groupedFloorUnits = Object.values(floorUnitsMap);

        updateFacilityData({
          selectedFloorUnits: groupedFloorUnits
        });

        navigate("/result");
      }
    } catch (error) {
      console.error('호수 선택 완료 실패:', error);
      alert('면적 조회에 실패했습니다. 다시 시도해주세요.');
    }
  };

  // 여러층 모드에서 최종 제출 (선택 완료)
  const handleFinalSubmit = () => {
    if (selectedFloorUnits.length === 0) {
      return;
    }

    // Context에 선택된 층/호실 정보 저장
    updateFacilityData({
      selectedFloorUnits: selectedFloorUnits
    });

    // Result 페이지로 이동
    navigate("/result");
  };

  // FloorSelector에서는 동 선택 단계가 없으므로 불필요

  // 호실 선택 화면에서 층 선택 화면으로 돌아가기
  const handleBackToPreviousStep = () => {
    // FloorSelector는 floor → unit 흐름만 처리
    // 동 선택은 DongSelector에서 이미 완료됨
    setCurrentStep("floor");
    setSelectedUnits([]);
  };

  // 헤더 뒤로가기 버튼 핸들러
  const handleHeaderBack = () => {
    switch (currentStep) {
      case "floor":
        // 층 선택 화면: 건물 타입 선택 페이지로 명시적 이동
        navigate("/buildingType");
        break;
      case "unit":
        // 호실 선택 화면: 층 선택 화면으로
        handleBackToPreviousStep();
        break;
      default:
        navigate("/dong");
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
            selectedFloors={selectedFloors} // 여러층 모드용
            onFloorSelect={handleFloorSelect}
            loading={loading}
            selectedFloorUnits={selectedFloorUnits}
            removeFloorUnit={removeFloorUnit}
            isSingleFloorMode={isSingleFloorMode} // 단층/여러층 모드 구분
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
            onAddMoreFloors={handleAddMoreFloors}
            loading={loading}
            selectedFloorUnits={selectedFloorUnits}
            removeFloorUnit={removeFloorUnit}
            isSingleFloorMode={isSingleFloorMode}
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
            selectedFloors={selectedFloors} // 여러층 모드용
            onFloorSelect={handleFloorSelect}
            loading={loading}
            selectedFloorUnits={selectedFloorUnits}
            removeFloorUnit={removeFloorUnit}
            isSingleFloorMode={isSingleFloorMode} // 단층/여러층 모드 구분
          />
        );
    }
  };
  const getButtonText = () => {
    switch (currentStep) {
      case "floor":
        if (isSingleFloorMode) {
          return selectedFloor ? "층을 선택했어요" : "층을 선택해주세요";
        } else {
          return selectedFloors && selectedFloors.length > 0
            ? `${selectedFloors.length}개 층을 선택했어요`
            : "층을 선택해주세요";
        }
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
        if (isSingleFloorMode) {
          return !selectedFloor;
        } else {
          return !selectedFloors || selectedFloors.length === 0;
        }
      case "unit":
        // 단층 모드: 기존 로직
        if (isSingleFloorMode) {
          return selectedUnits.length === 0 && selectedFloorUnits.length === 0;
        }

        // 여러층 모드: 모든 선택된 층에 대해 최소 1개 이상의 호실이 선택되었는지 확인
        // 현재 선택된 층들 (selectedFloors) 각각에 대해 호실이 있어야 함
        if (selectedFloors && selectedFloors.length > 0) {
          console.log("=== isButtonDisabled 디버깅 (여러층 모드) ===");
          console.log("selectedFloors:", selectedFloors);
          console.log("selectedUnits:", selectedUnits);

          // 각 층에 대해 선택된 호실이 있는지 확인
          const allFloorsHaveUnits = selectedFloors.every(floor => {
            // exposes가 빈 층은 호실 선택 불필요
            if (!floor.exposes || floor.exposes.length === 0) {
              console.log(`층 ${floor.flrGbCdNm} ${floor.flrNo}: 호실 정보 없음 (통과)`);
              return true;
            }

            // 해당 층의 호실이 selectedUnits에 있는지 확인
            const hasUnit = selectedUnits.some(unit => {
              const flrNoMatch = String(unit.flrNo) === String(floor.flrNo);
              const flrGbCdNmMatch = unit.flrGbCdNm === floor.flrGbCdNm;
              console.log(`  unit check: unit.flrNo=${unit.flrNo} (type: ${typeof unit.flrNo}), floor.flrNo=${floor.flrNo} (type: ${typeof floor.flrNo}), match=${flrNoMatch && flrGbCdNmMatch}`);
              return flrNoMatch && flrGbCdNmMatch;
            });

            console.log(`층 ${floor.flrGbCdNm} ${floor.flrNo}: hasUnit=${hasUnit}`);
            return hasUnit;
          });

          console.log("allFloorsHaveUnits:", allFloorsHaveUnits);
          console.log("버튼 비활성화:", !allFloorsHaveUnits);
          return !allFloorsHaveUnits;
        }

        // 이미 저장된 층이 있는 경우
        return selectedUnits.length === 0 && selectedFloorUnits.length === 0;
      default:
        return true;
    }
  };

  return (
    <>
      <DisasterHeader title="실손보상 소상공인 풍수해·지진재해보험" onBack={handleHeaderBack} />
      {loading && <Loading />}

      <div id={styles.container}>
        {renderCurrentStep()}

        {/* 여러층 모드에서 이미 층이 선택되어 있고 층 선택 화면일 때 최종 제출 버튼 표시 */}
        {!isSingleFloorMode && selectedFloorUnits.length > 0 && currentStep === "floor" && selectedFloors.length === 0 && (
          <SafetyButton
            buttonText="선택 완료하고 다음으로"
            onClick={handleFinalSubmit}
            disabled={false}
          />
        )}

        {/* 기본 다음 버튼 (여러층 모드의 최종 제출 상태가 아닐 때 표시) */}
        {(isSingleFloorMode || selectedFloorUnits.length === 0 || currentStep !== "floor" || selectedFloors.length > 0) && (
          <SafetyButton
            buttonText={getButtonText()}
            onClick={handleButtonClick}
            disabled={isButtonDisabled()}
          />
        )}
      </div>
    </>
  );
}

export default FloorSelector;
