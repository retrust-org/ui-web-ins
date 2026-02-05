import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../../css/disasterSafeguard/floorUnitSelect.module.css";
import SafetyButton from "../../../../components/buttons/SafetyButton";
import DisasterHeader from "../../../../components/headers/DisasterHeader";
import SearchInputsBox from "../../../../components/inputs/SearchInputsBox";
import { useDisasterInsurance } from "../../../../context/DisasterInsuranceContext";
import { useSessionState } from "../../hooks/useSessionState";
import Loading from "../../../../components/loadings/Loading";
import ErrorModal from "../../../../components/modals/ErrorModal";
import { buildingApiService } from "../../services/buildingApiService";

function DongSelector() {
  const navigate = useNavigate();
  const { buildingData, facilityData, updateFacilityData } = useDisasterInsurance();

  const [dongs, setDongs] = useState([]);
  // sessionStorage에서 복원 - 모든 모드에서 단일 동 선택
  const [selectedDong, setSelectedDong] = useSessionState(facilityData.selectedDong, null);
  const [dongSearchText, setDongSearchText] = useState("");
  const [filteredDongs, setFilteredDongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

  // 동 정보 가져오기 (캐싱된 unifiedApiData 사용)
  useEffect(() => {
    const fetchDongs = async () => {
      if (!buildingData?.unifiedApiData) {
        return;
      }

      setLoading(true);
      try {
        const unifiedData = buildingData.unifiedApiData;


        // 기존 buildingUnits 형식으로 변환 (호환성 유지)
        const buildingUnitsData = buildingApiService.transformToLegacyBuildingUnits(unifiedData);

        // 동 목록 추출
        const dongList = buildingApiService.getDongList(unifiedData);

        // buildingUnitsData를 Context에 저장 (호환성)
        updateFacilityData({
          buildingUnitsData: buildingUnitsData
        });

        // 동 목록 케이스 처리
        if (dongList.length === 0) {
          // Case 1: 동이 없음
          updateFacilityData({
            selectedDong: null
          });

          // BuildingType에 따라 분기
          if (facilityData.selectedBuildingType === "total") {
            // 건물전체: Result로 이동 (전체 건물 합산)
            navigate("/result");
          } else {
            // 단층/여러층: Floor로 이동
            navigate("/floor");
          }
        } else {
          // Case 2: 동이 1개 이상 → 선택 UI 표시 (1개여도 사용자가 선택하도록)
          setDongs(dongList);
          setFilteredDongs(dongList);
        }
      } catch (err) {
        console.error("==== DongSelector 에러 ====", err);
        setErrorModal({
          isOpen: true,
          message: "동 정보를 처리하는데 실패했습니다."
        });
        navigate("/addressSearch");
      } finally {
        setLoading(false);
      }
    };

    fetchDongs();
  }, [buildingData?.unifiedApiData, facilityData.selectedBuildingType, updateFacilityData, navigate, buildingData]);

  // 동 검색 핸들러
  const handleDongSearch = (e) => {
    const text = e.target.value;
    setDongSearchText(text);

    setFilteredDongs(
      text.trim() === ""
        ? dongs
        : dongs.filter((dong) => dong.toString().includes(text.trim()))
    );
  };

  // 동 선택 핸들러 - 모든 모드에서 단일 동 선택 (라디오 방식)
  const handleDongSelect = (dong) => {
    setSelectedDong(dong);
  };

  // 다음 단계로 이동
  const handleNext = () => {
    // 모든 모드에서 단일 동 선택 확인
    if (!selectedDong) {
      alert("동을 선택해주세요");
      return;
    }

    // Context에 선택된 동 저장
    updateFacilityData({
      selectedDong: selectedDong,
    });

    if (facilityData.selectedBuildingType === "total") {
      // 건물전체 모드: Result로 이동
      navigate("/result");
    } else {
      // 단층/여러층 모드: 층 선택 페이지로 이동
      navigate("/floor");
    }
  };

  return (
    <>
      <DisasterHeader title="실손보상 소상공인 풍수해·지진재해보험" />
      {loading && <Loading />}
      <div className={styles.container}>
        <section className={styles.floor}>
          <h2>동을 선택해주세요</h2>
          <SearchInputsBox
            placeholder="동을 검색할 수 있어요"
            value={dongSearchText}
            onChange={handleDongSearch}
          />
          <div className={styles.floorList}>
            <ul>
              {filteredDongs && filteredDongs.length > 0 ? (
                filteredDongs.map((dong, index) => {
                  // 모든 모드에서 selectedDong 단일값 체크
                  const isSelected = selectedDong === dong;

                  return (
                    <li
                      key={index}
                      className={isSelected ? styles.active : ""}
                      onClick={() => handleDongSelect(dong)}
                    >
                      {dong}
                    </li>
                  );
                })
              ) : (
                <li>동 정보가 없습니다</li>
              )}
            </ul>
          </div>
        </section>
        <SafetyButton
          buttonText="다음으로"
          onClick={handleNext}
          disabled={!selectedDong}
        />
      </div>

      {errorModal.isOpen && (
        <ErrorModal
          message={errorModal.message}
          onClose={() => setErrorModal({ isOpen: false, message: "" })}
        />
      )}
    </>
  );
}

export default DongSelector;
