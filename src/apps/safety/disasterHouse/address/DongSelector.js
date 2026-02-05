import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../../css/disasterSafeguard/floorUnitSelect.module.css";
import SafetyButton from "../../../../components/buttons/SafetyButton";
import DisasterHeader from "../../../../components/headers/DisasterHeader";
import SearchInputsBox from "../../../../components/inputs/SearchInputsBox";
import { useDisasterHouse } from "../../../../context/DisasterHouseContext";
import Loading from "../../../../components/loadings/Loading";
import ErrorModal from "../../../../components/modals/ErrorModal";

function DongSelector() {
  const navigate = useNavigate();
  const { buildingData, facilityData, updateFacilityData } = useDisasterHouse();

  const [dongs, setDongs] = useState([]);
  const [selectedDong, setSelectedDong] = useState(facilityData.selectedDong || null);
  const [dongSearchText, setDongSearchText] = useState("");
  const [filteredDongs, setFilteredDongs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

  const hasFetched = useRef(false);

  // 동 정보 가져오기 (캐싱된 unifiedApiData 사용)
  useEffect(() => {
    const fetchDongs = async () => {
      if (!buildingData?.unifiedApiData || hasFetched.current) {
        return;
      }

      hasFetched.current = true;
      setLoading(true);
      try {
        const unifiedData = buildingData.unifiedApiData;
        const titles = unifiedData.data?.registryInfo?.titles || [];
        const eligibleDongSet = new Set();

        titles.forEach(title => {
          // 창고시설 제외 (mainPurpsCd가 "18"로 시작하거나 mainPurpsCdNm에 "창고" 포함)
          const isWarehouse = title.mainPurpsCd?.startsWith("18") || title.mainPurpsCdNm?.includes("창고");
          if (isWarehouse) {
            return;
          }

          // opjbCd가 있고 16층 미만이며 주건축물인 동만 추가 (부속건축물, 16층 이상, opjbCd 없는 동은 숨김)
          if (title.opjbCd && (title.grndFlrCnt || 0) < 16 && title.mainAtchGbCdNm === "주건축물") {
            const dongName = title.dongNm?.trim() || title.bldNm?.trim() || title.mainAtchGbCdNm?.trim();
            if (dongName) {
              eligibleDongSet.add(dongName);
            }
          }
        });

        // 숫자 기준 정렬
        const dongList = Array.from(eligibleDongSet).sort((a, b) => {
          const numA = parseInt(a.replace(/[^0-9]/g, "")) || 0;
          const numB = parseInt(b.replace(/[^0-9]/g, "")) || 0;
          return numA - numB;
        });

        // 동 목록 설정
        if (dongList.length === 0) {
          // 동이 없음 → 주소 검색으로 이동
          setErrorModal({
            isOpen: true,
            message: "가입 가능한 동이 없습니다."
          });
        } else {
          setDongs(dongList);
          setFilteredDongs(dongList);
        }
      } catch (err) {
        console.error("==== DongSelector 에러 ====", err);
        setErrorModal({
          isOpen: true,
          message: "동 정보를 처리하는데 실패했습니다."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDongs();
  }, [buildingData?.unifiedApiData]);

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

  // 동 선택 핸들러
  const handleDongSelect = (dong) => {
    setSelectedDong(dong);
  };

  // 다음 단계로 이동
  const handleNext = () => {
    if (!selectedDong) {
      alert("동을 선택해주세요");
      return;
    }

    const unifiedData = buildingData?.unifiedApiData;
    const titles = unifiedData?.data?.registryInfo?.titles || [];

    // 선택한 동의 title 정보 찾기
    const selectedTitle = titles.find(title => {
      const dongName = title.dongNm?.trim() || title.bldNm?.trim() || title.mainAtchGbCdNm?.trim();
      return dongName === selectedDong;
    });

    // 단독주택인 경우 바로 Result 페이지로 이동 (동 전체 면적 사용)
    if (facilityData.isDetachedHouse) {
      const dongArea = selectedTitle?.totDongTotArea || selectedTitle?.totArea || 0;

      updateFacilityData({
        selectedDong: selectedDong,
        selectedFloorUnits: [],
        area: dongArea,
        unitCount: 1
      });

      navigate("/address/result");
    } else {
      // 단독주택이 아닌 경우 층 선택 페이지로 이동
      updateFacilityData({
        selectedDong: selectedDong,
      });

      navigate("/address/floor");
    }
  };

  return (
    <>
      <DisasterHeader
        title="실손보상 주택 풍수해·지진재해보험"
        backPath="/address/search"
      />
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
          onClose={() => {
            setErrorModal({ isOpen: false, message: "" });
            navigate("/address/search");
          }}
        />
      )}
    </>
  );
}

export default DongSelector;
