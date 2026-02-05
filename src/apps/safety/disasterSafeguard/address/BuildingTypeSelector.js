import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../../css/disasterSafeguard/buildingTypeSelector.module.css";
import DisasterHeader from "../../../../components/headers/DisasterHeader";
import BaseModalCenter from "../../../../components/layout/BaseModalCenter";
import notSelectedIcon from "../../../../assets/build-notSelectedIcon.svg";
import activeSelectedIcon from "../../../../assets/build-activeSelectedIcon.svg";
import selectedFloorImage from "../../../../assets/build-selectedFloor.svg";
import selectedFloorImage2 from "../../../../assets/build-selectedFloor2.svg";
import selectedTotalImage from "../../../../assets/build-total.svg";
import multipleTotalBuildingsImage from "../../../../assets/multiple-total-buildings.svg";
import { useDisasterInsurance } from "../../../../context/DisasterInsuranceContext";
import { useSessionState } from "../../hooks/useSessionState";
import { buildingApiService } from "../../services/buildingApiService";

function BuildingTypeSelector() {
  const navigate = useNavigate();
  const { buildingData, facilityData, updateFacilityData } = useDisasterInsurance();

  // 동(Dong) 존재 여부 확인 (exposes의 dongNm 기준)
  const hasDongs = buildingData?.unifiedApiData
    ? buildingApiService.hasDongs(buildingData.unifiedApiData)
    : false;

  // sessionStorage에서 복원
  const [selectedOption, setSelectedOption] = useSessionState(facilityData.selectedBuildingType, null);
  const [isAutoRedirecting, setIsAutoRedirecting] = useState(false);

  // 호수 정보가 없는 경우 자동으로 동 선택 페이지로 이동
  useEffect(() => {
    // hasUnitInfo === false: 호수 정보 없음 (일반건물) → 동 선택 후 층 선택
    if (facilityData.hasUnitInfo === false) {
      setIsAutoRedirecting(true);

      // "여러층" 자동 선택
      updateFacilityData({
        selectedBuildingType: "multiple-floors"
      });

      // 동 선택 페이지로 자동 이동
      navigate("/dong");
    }
  }, [facilityData.hasUnitInfo, navigate, updateFacilityData]);

  // 옵션 선택 핸들러
  const handleOptionSelect = (option) => {
    setSelectedOption(option);
  };

  // 다음 단계로 이동하는 핸들러
  const handleNextStep = () => {
    if (!selectedOption) return;

    // Context에 선택된 건물 타입 저장
    updateFacilityData({
      selectedBuildingType: selectedOption
    });

    // 선택된 옵션에 따라 다음 단계로 이동
    if (selectedOption === "total") {
      // 동 존재 여부 확인
      const buildingHasDongs = buildingData?.unifiedApiData
        ? buildingApiService.hasDongs(buildingData.unifiedApiData)
        : false;

      if (buildingHasDongs) {
        // 건물 전체 선택 시: 동 선택 페이지로 이동
        navigate("/dong");
      } else {
        // 동이 없으면 바로 결과 페이지로 이동 (전체 건물 합산)
        navigate("/result");
      }
    } else if (selectedOption === "all-buildings") {
      // 여러건물전체 선택 시: 모든 동을 자동 선택하고 결과 페이지로 이동 (buildingApiService 사용)
      const dongList = buildingData?.unifiedApiData
        ? buildingApiService.getDongList(buildingData.unifiedApiData)
        : [];
      const allDongs = dongList;

      // 모든 동을 selectedFloorUnits에 저장
      const allDongUnits = allDongs.map(dong => ({
        dong: dong,
        floor: { flrNo: null, flrGbCdNm: null },
        units: []
      }));

      updateFacilityData({
        selectedFloorUnits: allDongUnits
      });

      navigate("/result");
    } else if (selectedOption === "single-floor" || selectedOption === "multiple-floors") {
      // 단층 or 여러층 선택 시
      const buildingHasDongs = buildingData?.unifiedApiData
        ? buildingApiService.hasDongs(buildingData.unifiedApiData)
        : false;

      if (buildingHasDongs) {
        // 동이 있으면 동 선택 페이지로 이동
        navigate("/dong");
      } else {
        // 동이 없으면 selectedDong을 null로 초기화하고 층 선택 페이지로 이동
        updateFacilityData({
          selectedDong: null
        });
        navigate("/floor");
      }
    }
  };

  // 호수 정보가 없어서 자동 리다이렉트 중일 때 아무것도 렌더링하지 않음
  if (isAutoRedirecting || facilityData.hasUnitInfo === false) {
    return null;
  }

  return (
    <>
      <DisasterHeader
        title="실손보상 소상공인 풍수해·지진재해보험"
        highZIndex={true}
        onBack={() => navigate("/addressSearch")}
      />
      <BaseModalCenter isOpen={true}>
        <div className={styles.buildingTypeContainer}>
          <p className={styles.title}>
            이용중인 <span className={styles.highlight}>사업장 범위</span>를{" "}
            <br />
            선택해주세요
          </p>
        </div>
        <div className={styles.optionContents}>
          {/* 단층 옵션 - 항상 표시 */}
          <div
            className={`${styles.optionMenu} ${selectedOption === "single-floor" ? styles.active : ""
              }`}
            onClick={() => handleOptionSelect("single-floor")}
          >
            <img
              src={
                selectedOption === "single-floor"
                  ? activeSelectedIcon
                  : notSelectedIcon
              }
              alt="선택 아이콘"
              className={styles.selectionIcon}
            />
            <div className={styles.option}>
              <p className={selectedOption === "single-floor" ? styles.active : ""}>
                단층
              </p>
              <img
                src={selectedFloorImage}
                alt="singleFloorIcon"
                className={styles.optionImage}
              />
            </div>
          </div>

          {/* 여러층 옵션 - 항상 표시 */}
          <div
            className={`${styles.optionMenu} ${selectedOption === "multiple-floors" ? styles.active : ""
              }`}
            onClick={() => handleOptionSelect("multiple-floors")}
          >
            <img
              src={
                selectedOption === "multiple-floors"
                  ? activeSelectedIcon
                  : notSelectedIcon
              }
              alt="선택 아이콘"
              className={styles.selectionIcon}
            />
            <div className={styles.option}>
              <p className={selectedOption === "multiple-floors" ? styles.active : ""}>
                여러층
              </p>
              <img
                src={selectedFloorImage2}
                alt="multipleFloorsIcon"
                className={styles.optionImage}
              />
            </div>
          </div>

          {/* 건물전체 옵션 - 항상 표시 */}
          <div
            className={`${styles.optionMenu} ${selectedOption === "total" ? styles.active : ""
              }`}
            onClick={() => handleOptionSelect("total")}
          >
            <img
              src={
                selectedOption === "total"
                  ? activeSelectedIcon
                  : notSelectedIcon
              }
              alt="선택 아이콘"
              className={styles.selectionIcon}
            />
            <div className={styles.option}>
              <p className={selectedOption === "total" ? styles.active : ""}>
                건물전체
              </p>
              <img
                src={selectedTotalImage}
                alt="totalIcon"
                className={styles.optionImage}
              />
            </div>
          </div>

          {/* 여러건물전체 옵션 - 동이 있을 때만 표시 */}
          {hasDongs && (
            <div
              className={`${styles.optionMenu} ${selectedOption === "all-buildings" ? styles.active : ""
                }`}
              onClick={() => handleOptionSelect("all-buildings")}
            >
              <img
                src={
                  selectedOption === "all-buildings"
                    ? activeSelectedIcon
                    : notSelectedIcon
                }
                alt="선택 아이콘"
                className={styles.selectionIcon}
              />
              <div className={styles.option}>
                <p className={selectedOption === "all-buildings" ? styles.active : ""}>
                  여러건물전체
                </p>
                <img
                  src={multipleTotalBuildingsImage}
                  alt="allBuildingsIcon"
                  className={styles.optionImage}
                />
              </div>
            </div>
          )}
        </div>
        <div className={styles.buttonContainer}>
          <button
            className={styles.nextButton}
            onClick={handleNextStep}
            disabled={!selectedOption}
          >
            다음으로
          </button>
        </div>
      </BaseModalCenter>
    </>
  );
}

export default BuildingTypeSelector;
