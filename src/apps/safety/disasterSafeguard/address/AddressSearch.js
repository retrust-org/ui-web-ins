import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../../css/disasterSafeguard/addressSearch.module.css";
import SafetyButton from "../../../../components/buttons/SafetyButton";
import DisasterHeader from "../../../../components/headers/DisasterHeader";
import searchIcon from "../../../../assets/addressSearch-search.svg";
import { useDisasterInsurance } from "../../../../context/DisasterInsuranceContext";
import Loading from "../../../../components/loadings/Loading";
import ErrorModal from "../../../../components/modals/ErrorModal";
import { buildingApiService } from "../../services/buildingApiService";

function AddressSearch() {
  const navigate = useNavigate();
  const { updateBuildingData, updateFacilityData } = useDisasterInsurance();
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [buildingLoading, setBuildingLoading] = useState(false); // 건물 정보 로딩 (버튼 클릭 시만)
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

  const searchTimeout = useRef(null);

  // 검색어 변경 시 주소 검색 API 호출
  useEffect(() => {
    if (searchQuery.length >= 2) {
      // 이전 타임아웃 취소
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

      // 타이핑이 멈춘 후 300ms 후에 API 호출
      searchTimeout.current = setTimeout(() => {
        fetchAddressSuggestions(searchQuery);
      }, 300);
    } else {
      setAddressSuggestions([]);
      setShowSuggestions(false);
    }

    return () => {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }
    };
  }, [searchQuery]);

  // 주소 검색 제안 가져오기
  const fetchAddressSuggestions = async (query) => {
    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL
        }/api/v3/kko/address?keyword=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      // errCd 체크 - "00001"이 아니면 에러
      if (data.errCd && data.errCd !== "00001") {
        setErrorModal({
          isOpen: true,
          message: data.errMsg || "주소 검색 중 오류가 발생했습니다."
        });
        setAddressSuggestions([]);
        return;
      }

      // 도로명주소 API 응답 형식에 맞게 데이터 변환
      if (data && data.results && data.results.juso) {
        const jusoItems = data.results.juso;
        setAddressSuggestions(jusoItems);
        setShowSuggestions(true);
      } else {
        setAddressSuggestions([]);
      }
    } catch (err) {
      setAddressSuggestions([]);
      setErrorModal({
        isOpen: true,
        message: "주소 검색 중 오류가 발생했습니다."
      });
    }
  };

  // 검색창 입력 핸들러
  const handleSearchInputChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
  };

  // 검색 버튼 핸들러 (검색창만 포커스)
  const handleSearchButtonClick = () => {
    const searchInput = document.querySelector(`.${styles.searchInput}`);
    if (searchInput) {
      searchInput.focus();
    }
  };

  // 검색창 포커스 시 주소 제안 표시
  const handleSearchFocus = () => {
    if (addressSuggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // 버튼 클릭 시 API 호출 후 다음 페이지 이동
  const handleNextStep = async () => {
    if (!selectedSuggestion) {
      setError("먼저 주소를 선택해주세요.");
      return;
    }

    // 선택한 주소의 건물 정보 조회 파라미터 준비
    const admCd = selectedSuggestion.admCd;
    const sigunguCd = admCd.substring(0, 5);

    const buildingInfoParams = {
      bcode: admCd,
      sigunguCode: sigunguCd,
      jibunAddress: selectedSuggestion.jibunAddr,
      autoJibunAddress: selectedSuggestion.jibunAddr,
      lnbrMnnm: selectedSuggestion.lnbrMnnm,
      lnbrSlno: selectedSuggestion.lnbrSlno,
    };

    // API 호출 (Loading이 표시됨)
    const success = await getBuildingInfo(buildingInfoParams);

    // API 성공 시 BuildingType 선택 페이지로 이동
    if (success) {
      navigate("/buildingType");
    }
  };

  // 창고시설 여부 확인
  const isWarehouseFacility = (addressInfo) => {
    const mainPurpsCd = addressInfo?.mainPurpsCd;
    const mainPurpsCdNm = addressInfo?.mainPurpsCdNm;

    // 코드 "18000" 또는 이름에 "창고" 포함
    return mainPurpsCd === "18000" || mainPurpsCdNm?.includes("창고");
  };

  const getBuildingInfo = async (addressData) => {
    try {
      setBuildingLoading(true);

      if (!addressData?.bcode) {
        setError("주소 정보가 올바르지 않습니다.");
        setBuildingLoading(false);
        return;
      }

      try {
        // PNU 생성
        const pnu = buildingApiService.constructPNU(
          selectedSuggestion.admCd,
          selectedSuggestion.lnbrMnnm,
          selectedSuggestion.lnbrSlno,
          selectedSuggestion.mtYn
        );

        // 통합 Building API 호출
        const unifiedData = await buildingApiService.fetchUnifiedBuildingInfo(pnu);

        // 창고시설 검증 (API 응답 직후)
        if (isWarehouseFacility(unifiedData.data.addressInfo)) {
          setErrorModal({
            isOpen: true,
            message: (
              <>
                창고시설은
                <br />
                보험 가입이 불가능합니다
              </>
            )
          });
          // 주소 초기화
          setSelectedSuggestion(null);
          setSearchQuery("");
          setAddressSuggestions([]);
          setShowSuggestions(false);
          return false; // 실패 반환
        }

        // 기존 titleInfo 형식으로 변환
        const titleInfo = buildingApiService.transformToLegacyTitleInfo(unifiedData);

        // 내진설계 여부 추출 및 매핑
        const earthquakeResistantDesign = buildingApiService.getEarthquakeResistantDesign(unifiedData);

        // Context에 데이터 저장 (기존 titleInfo + PNU + 원본 캐싱 + 내진설계여부)
        updateBuildingData({
          grndFlrCnt: titleInfo.grndFlrCnt || 0,
          ugrndFlrCnt: titleInfo.ugrndFlrCnt || 0,
          titleInfo: titleInfo,
          pnu: pnu,
          unifiedApiData: unifiedData,
          earthquakeResistantDesign: earthquakeResistantDesign,
          bldgGrd: ""  // 건물등급 초기화
        });

        // 새 건물 조회 시 이전 선택 정보 초기화
        updateFacilityData({
          selectedDong: null,
          selectedDongs: [],
          selectedFloorUnits: [],
          selectedBuildingType: "",
          exteriorWallType: "",      // 외벽 초기화
          area: null,                 // 면적 초기화
          buildingUnitsData: null     // 호실 데이터 초기화
        });

        return true; // 성공
      } catch (err) {
        console.error("==== 통합 API 호출 에러 ====", err);
        setErrorModal({
          isOpen: true,
          message: err.message || "건물 정보를 불러오는데 실패했습니다."
        });
        return false; // 실패
      } finally {
        setBuildingLoading(false);
      }
    } catch (err) {
      setError("건물 정보 처리 중 오류가 발생했습니다.");
      setBuildingLoading(false);
      return false; // 실패
    }
  };

  return (
    <>
      <DisasterHeader
        title="실손보상 소상공인 풍수해·지진재해보험"
        onBack={() => navigate("/address")}
      />
      {buildingLoading && <Loading />}
      <section
        className={styles.addressSearchSection}
        onClick={(e) => {
          // 검색 결과 영역 외 클릭 시에만 제안 목록 닫기
          if (!e.target.closest(`.${styles.resultsContainer}`)) {
            // 검색창은 계속 유지하도록 수정
            if (!e.target.closest(`.${styles.searchContainer}`)) {
              setShowSuggestions(false);
            }
          }
        }}
      >
        <h1 className={styles.title}>주소 검색</h1>

        <div className={styles.searchContainer}>
          <input
            type="text"
            value={searchQuery}
            onChange={handleSearchInputChange}
            onFocus={handleSearchFocus}
            placeholder="주소를 검색해주세요"
            className={styles.searchInput}
          />
          <img
            src={searchIcon}
            alt="searchIcon"
            onClick={handleSearchButtonClick}
          />
        </div>

        {/* 주소 검색 제안 목록 - 별도 컨테이너로 분리 */}
        {showSuggestions && addressSuggestions.length > 0 && (
          <div className={styles.resultsContainer}>
            <div className={styles.suggestionList}>
              {addressSuggestions.map((suggestion, index) => (
                <div
                  key={index}
                  className={`${styles.suggestionItem} ${selectedSuggestion &&
                    selectedSuggestion.bdMgtSn === suggestion.bdMgtSn
                    ? styles.active
                    : ""
                    }`}
                  onClick={(e) => {
                    // 이벤트 전파 중단하여 부모 요소의 클릭 이벤트가 발생하지 않도록 함
                    e.stopPropagation();
                    // 선택 상태만 업데이트
                    setSelectedSuggestion(suggestion);

                    // Context에 기본 주소 정보 먼저 저장
                    updateBuildingData({
                      sggNm: suggestion.sggNm,
                      lctnAdr: suggestion.jibunAddr,
                      siNm: suggestion.siNm,
                      emdNm: suggestion.emdNm,
                      bdNm: suggestion.bdNm || "",
                      roadAddr: suggestion.roadAddr
                    });

                    setError(null);
                  }}
                >
                  <div className={styles.addressContent}>
                    {suggestion.roadAddrPart1 && (
                      <div className={styles.roadAddress}>
                        <p>{suggestion.roadAddrPart1}</p>
                        {suggestion.roadAddrPart2 && (
                          <p>{suggestion.roadAddrPart2}</p>
                        )}
                      </div>
                    )}
                    {/* 지번 주소 표시 */}
                    <div className={styles.jibunAddress}>
                      {suggestion.jibunAddr}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && <p className={styles.errorMessage}>{error}</p>}
      </section>
      <SafetyButton
        buttonText={buildingLoading ? "건물 정보 조회 중..." : "주소를 선택했어요"}
        onClick={handleNextStep}
        disabled={!selectedSuggestion || buildingLoading}
      />

      {errorModal.isOpen && (
        <ErrorModal
          message={errorModal.message}
          onClose={() => setErrorModal({ isOpen: false, message: "" })}
        />
      )}
    </>
  );
}

export default AddressSearch;
