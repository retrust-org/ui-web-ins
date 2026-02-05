import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../../css/disasterHouse/addressSearch.module.css";
import SafetyButton from "../../../../components/buttons/SafetyButton";
import DisasterHeader from "../../../../components/headers/DisasterHeader";
import searchIcon from "../../../../assets/addressSearch-search.svg";
import Loading from "../../../../components/loadings/Loading";
import ErrorModal from "../../../../components/modals/ErrorModal";
import HanokModal from "./HanokModal";
import { buildingApiService } from "../../services/buildingApiService";
import { useDisasterHouse } from "../../../../context/DisasterHouseContext";
import { checkApiError } from "../../../../utils/checkApiError";

function AddressSearch() {
  const navigate = useNavigate();
  const { updateBuildingData, updateFacilityData, updateCoverageAmounts } = useDisasterHouse();
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [addressSuggestions, setAddressSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });
  const [showHanokModal, setShowHanokModal] = useState(false);
  const [pendingPnu, setPendingPnu] = useState(null);

  const searchTimeout = useRef(null);

  // 검색어 변경 시 주소 검색 API 호출
  useEffect(() => {
    if (searchQuery.length >= 2) {
      if (searchTimeout.current) {
        clearTimeout(searchTimeout.current);
      }

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
        `${process.env.REACT_APP_BASE_URL}/api/v3/kko/address?keyword=${encodeURIComponent(query)}`
      );

      const data = await response.json();

      if (!checkApiError(data, setErrorModal)) {
        setAddressSuggestions([]);
        return;
      }

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

  // 검색 버튼 핸들러
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

  // 다음 단계 버튼 클릭 - 한옥 모달 표시
  const handleNextStep = () => {
    if (!selectedSuggestion) {
      setError("먼저 주소를 선택해주세요.");
      return;
    }

    // PNU 생성 및 저장
    const pnu = buildingApiService.constructPNU(
      selectedSuggestion.admCd,
      selectedSuggestion.lnbrMnnm,
      selectedSuggestion.lnbrSlno,
      selectedSuggestion.mtYn
    );

    setPendingPnu(pnu);
    setShowHanokModal(true);
  };

  // 한옥 여부 선택 후 API 호출
  const handleHanokSelect = async (isHanok) => {
    setShowHanokModal(false);

    try {
      setLoading(true);

      // 새 주소 등록 시 이전 데이터 초기화
      updateFacilityData({
        exteriorWallType: "",     // 외벽 타입 초기화
        buildingCost: null        // 건물 가격 정보 초기화
      });
      updateCoverageAmounts({
        bldgSbcAmt: 0             // 건물 가입금액 초기화
      });

      // 건물 정보 API 호출 (주택풍수해 상품코드: 17604, 한옥 여부 포함)
      const buildingInfo = await buildingApiService.fetchUnifiedBuildingInfo(pendingPnu, '17604', isHanok);

      // 내진설계여부 및 영위직종코드 추출
      const earthquakeResistantDesign = buildingApiService.getEarthquakeResistantDesign(buildingInfo);
      const titles = buildingInfo.data?.registryInfo?.titles || [];

      // opjbCd가 있고 16층 미만인 titles만 가입 가능 (16층 이상, opjbCd 없는 동, 창고시설 숨김)
      const validTitles = titles.filter(title => {
        if (!title.opjbCd || (title.grndFlrCnt || 0) >= 16) {
          return false;
        }
        // 창고시설 제외 (mainPurpsCd가 "18"로 시작하거나 mainPurpsCdNm에 "창고" 포함)
        const isWarehouse = title.mainPurpsCd?.startsWith("18") || title.mainPurpsCdNm?.includes("창고");
        if (isWarehouse) {
          return false;
        }
        return true;
      });

      // 가입 가능한 동이 하나도 없으면 가입 불가
      if (validTitles.length === 0) {
        // opjbCd는 있지만 16층 이상인 경우와 opjbCd가 없는 경우 구분
        const hasOpjbCdButTooManyFloors = titles.some(title => title.opjbCd && (title.grndFlrCnt || 0) >= 16);
        setErrorModal({
          isOpen: true,
          message: "해당 건물은 가입이 불가능해요",
          subMsg: hasOpjbCdButTooManyFloors
            ? "16층 이상 건물은 가입이 불가능합니다."
            : "주택풍수해 보험은 주거용 건물만 가입 가능합니다."
        });
        return;
      }

      // 아파트인데 호수 정보가 없는 경우 차단 (주건축물만 체크)
      const mainBuildingTitles = validTitles.filter(title =>
        title.mainAtchGbCdNm === "주건축물"
      );

      const isApartment = mainBuildingTitles.some(title =>
        title.etcPurps?.includes("아파트") ||
        title.mainPurpsCd === "02001"
      );

      if (isApartment) {
        // 주건축물의 실제 층(flrNo > 0)에 호수 정보가 있는지 확인
        const hasValidUnitInfo = mainBuildingTitles.some(title => {
          const actualFloors = title.floors?.filter(f => f.flrNo > 0) || [];
          return actualFloors.some(floor =>
            floor.exposes && floor.exposes.length > 0
          );
        });

        if (!hasValidUnitInfo) {
          setErrorModal({
            isOpen: true,
            message: "해당 건물은 저희 서비스에서 가입이 불가능합니다.",
            subMsg: "고객센터로 문의해주세요."
          });
          return;
        }
      }

      const firstValidOpjbCd = validTitles[0]?.opjbCd || "";

      // Context에 건물 데이터 저장
      updateBuildingData({
        pnu: pendingPnu,
        unifiedApiData: buildingInfo,
        lctnAdr: selectedSuggestion.roadAddrPart1 || selectedSuggestion.jibunAddr,
        siNm: selectedSuggestion.siNm || "",
        sggNm: selectedSuggestion.sggNm || "",
        earthquakeResistantDesign: earthquakeResistantDesign,
        opjbCd: firstValidOpjbCd,
        isHanok: isHanok
      });

      // 단독주택 영위직종코드 목록
      const DETACHED_HOUSE_CODES = ["00014", "00017"];
      // 단독주택 확인: 유효한 title이 1개이고 단독주택 코드인 경우
      const isDetachedHouse = validTitles.length === 1 && DETACHED_HOUSE_CODES.includes(validTitles[0].opjbCd);
      // API에서 반환된 실제 건물 수 (가입 불가 건물 포함)
      const titleCnt = titles.length;

      if (isDetachedHouse && titleCnt === 1) {
        // 단독주택 + 건물 1개: 동/층/호실 선택 없이 바로 Result 페이지로 이동
        const totArea = validTitles[0]?.totArea
          || validTitles[0]?.totDongTotArea
          || buildingInfo.data?.addressInfo?.totArea
          || 0;

        updateFacilityData({
          selectedDong: null,
          selectedFloorUnits: [],
          area: totArea,
          unitCount: null,
          isDetachedHouse: true
        });

        navigate("/address/result");
      } else if (isDetachedHouse && titleCnt > 1) {
        // 단독주택 + 건물 여러개: 동 선택 페이지로 이동
        updateFacilityData({
          selectedDong: null,
          selectedFloorUnits: [],
          area: null,
          unitCount: null,
          isDetachedHouse: true
        });

        navigate("/address/dong");
      } else {
        // 단독주택 아님: 기존 로직
        updateFacilityData({
          selectedDong: null,
          selectedFloorUnits: [],
          area: null,
          unitCount: null,
          isDetachedHouse: false
        });

        const hasDongs = buildingApiService.hasDongs(buildingInfo);
        if (hasDongs) {
          navigate("/address/dong");
        } else {
          navigate("/address/floor");
        }
      }

    } catch (err) {

      setErrorModal({
        isOpen: true,
        message: err.message || "건물 정보를 불러오는데 실패했습니다."
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DisasterHeader
        title="실손보상 주택 풍수해·지진재해보험"
        backPath="/address"
      />
      {loading && <Loading />}
      <section
        className={styles.addressSearchSection}
        onClick={(e) => {
          if (!e.target.closest(`.${styles.resultsContainer}`)) {
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

        {/* 주소 검색 제안 목록 */}
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
                    e.stopPropagation();
                    setSelectedSuggestion(suggestion);
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
        buttonText={loading ? "건물 정보 조회 중..." : "주소를 선택했어요"}
        onClick={handleNextStep}
        disabled={!selectedSuggestion || loading}
      />

      {errorModal.isOpen && (
        <ErrorModal
          message={errorModal.message}
          subMsg={errorModal.subMsg}
          onClose={() => setErrorModal({ isOpen: false, message: "", subMsg: "" })}
        />
      )}

      <HanokModal
        isOpen={showHanokModal}
        onClose={() => setShowHanokModal(false)}
        onSelect={handleHanokSelect}
      />
    </>
  );
}

export default AddressSearch;
