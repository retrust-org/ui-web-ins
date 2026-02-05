import React, { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../../css/disasterSafeguard/result.module.css";
import coverageSupport from "../../../../assets/safeGuard-support.svg";
import peoples from "../../../../assets/address-people.svg";
import fingerClick from "../../../../assets/fingerClick.svg";
import ExteriorWall from "./ExteriorWall";
import ChkModal from "../../components/ChkModal";
import Question from "../workplace/Question";
import { useDisasterInsurance } from "../../../../context/DisasterInsuranceContext";
import { useSessionState } from "../../hooks/useSessionState";
import Loading from "../../../../components/loadings/Loading";
import DisasterHeader from "../../../../components/headers/DisasterHeader";
import ErrorModal from "../../../../components/modals/ErrorModal";
import NoticeModal from "../../../../components/modals/NoticeModal";
import { buildingApiService } from "../../services/buildingApiService";

function ResultDisplay() {
  const navigate = useNavigate();
  const { buildingData, facilityData, updateFacilityData, updateBuildingData } = useDisasterInsurance();

  const [buildingInfo, setBuildingInfo] = useState(null);
  const [selectedOption, setSelectedOption] = useState("");
  const [selectedFloorUnits, setSelectedFloorUnits] = useState([]);
  const [totalUnitArea, setTotalUnitArea] = useState(0);
  const [roofInfo, setRoofInfo] = useState("");
  const [structInfo, setStructInfo] = useState("");
  const [isExteriorWallModalOpen, setIsExteriorWallModalOpen] = useState(false);

  // sessionStorage에서 외벽 타입 복원
  const [exteriorWallType, setExteriorWallType] = useSessionState(facilityData.exteriorWallType, "");

  const [areaResult, setAreaResult] = useState([]);
  const [isLoadingArea, setIsLoadingArea] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

  // Question 모달 상태 추가
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);

  // 체크모달 상태 추가
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);
  const [isNoticeModalOpen, setIsNoticeModalOpen] = useState(false);

  // NoticeModal이 이미 표시되었는지 추적
  const noticeModalShownRef = useRef(false);

  // 모달 핸들러 함수들
  const openFirstModal = () => setIsFirstModalOpen(true);
  const closeFirstModal = () => setIsFirstModalOpen(false);
  const closeSecondModal = () => setIsSecondModalOpen(false);

  // Question 모달 핸들러
  const openQuestionModal = () => setIsQuestionModalOpen(true);
  const closeQuestionModal = () => setIsQuestionModalOpen(false);

  // 1차 모달 확인 버튼 핸들러 - Question 모달 오픈하도록 수정
  const handleFirstConfirm = () => {
    closeFirstModal();
    openQuestionModal(); // ChkModal 확인 후 Question 모달 오픈
  };

  // 2차 모달 확인 버튼 핸들러
  const handleSecondConfirm = () => {
    closeSecondModal();
  };

  const wallTypeNames = {
    concrete: "콘크리트",
    brick: "조적 (벽돌,석조)",
    wood: "목재",
    panel: "샌드위치패널",
    unknown: "잘 모르겠어요",
  };

  const isButtonDisabled = () => {
    // 기본 정보 검증 (외벽 제외)
    if (!structInfo || structInfo.trim() === "") return true;
    if (!roofInfo || roofInfo.trim() === "") return true;
    if (floorCount === 0 || floorDisplay === "미선택") return true;

    // 외벽 선택 후에만 면적 검증
    if (exteriorWallType) {
      const currentArea = selectedOption === "total" ? totalArea : totalUnitArea;
      if (!currentArea || currentArea <= 0) return true;
    }

    return false;
  };

  const openExteriorWallModal = () => setIsExteriorWallModalOpen(true);
  const handleWallSelect = (wallType) => {
    setExteriorWallType(wallType);

    // 건물등급 결정
    const determineBuildingGrade = (exteriorType) => {
      // 여러건물전체 케이스: 외벽 타입과 무관하게 가장 낮은 등급 유지
      if (selectedOption === "all-buildings") {
        const lowestGrade = buildingApiService.getLowestFireGradeForAllBuildings(
          buildingData.unifiedApiData
        );
        return lowestGrade || ""; // 등급 정보가 없으면 빈 문자열
      }

      // 기존 로직: 다른 모든 케이스 (단층/여러층/건물전체)
      if (exteriorType === "wood") return "4";      // 목재: 4등급
      if (exteriorType === "panel") return "3";     // 패널: 3등급
      if (exteriorType === "unknown") return "4";   // 잘모르겠어요: 4등급

      // 콘크리트, 벽돌 등은 서버에서 받은 화재등급 사용
      return buildingData.titleInfo?.fireGrade || "";
    };

    const bldgGrd = determineBuildingGrade(wallType);

    // Context에 외벽 타입과 건물등급 함께 저장
    updateFacilityData({ exteriorWallType: wallType });
    updateBuildingData({ bldgGrd: bldgGrd });

    setIsExteriorWallModalOpen(false);
  };

  // 간편조회하기 버튼 클릭 핸들러 추가
  const handleSearchClick = () => {
    // 외벽 미선택 시 외벽 선택 모달 열기
    if (!exteriorWallType) {
      openExteriorWallModal();
      window.scrollTo(0, 0);
      return;
    }

    // 외벽 선택 완료 후 기존 로직
    const currentArea = selectedOption === "total" ? totalArea : totalUnitArea;
    updateFacilityData({ area: currentArea });

    openFirstModal();
  };

  // 재검색 버튼 클릭 핸들러
  const handleReSearch = () => {
    // 건물/시설 관련 데이터 초기화 (주소가 바뀌면 모든 건물 정보 재설정 필요)
    updateFacilityData({
      selectedFloorUnits: [],
      selectedBuildingType: "",
      selectedDong: null,
      selectedDongs: [],
      area: null,
      sfdgFclTpCd: "",
      owsDivCon: "",
      polhdCusTpCd: "",
      exteriorWallType: "",
      buildingUnitsData: null
    });

    updateBuildingData({
      siNm: "",
      sggNm: "",
      grndFlrCnt: "",
      ugrndFlrCnt: "",
      lctnAdr: "",
      titleInfo: null,
      pnu: "",
      unifiedApiData: null,
      bldgGrd: "",
      earthquakeResistantDesign: ""
    });

    // 주소 검색 페이지로 이동
    navigate("/addressSearch");
  };

  // NoticeModal 재검색 핸들러
  const handleNoticeReSearch = () => {
    setIsNoticeModalOpen(false);
    handleReSearch();
  };

  // 면적 값을 m²에서 평수로 환산하는 함수
  const convertToKoreanUnit = (squareMeter) => {
    if (!squareMeter) return 0;
    return (squareMeter * 0.3025).toFixed(2);
  };

  // 숫자를 소수점 2자리까지 포맷팅하는 함수
  const formatNumber = (num) => {
    if (!num) return "0.00";
    return Number(num).toFixed(2);
  };

  // 여러 층과 호수에 대한 면적 정보를 가져오는 함수 (캐싱된 데이터 사용)
  const fetchMultipleUnitDetails = async (buildingData, floorUnits) => {
    if (!buildingData?.unifiedApiData) return;

    setIsLoadingArea(true);

    try {
      const unifiedData = buildingData.unifiedApiData;


      // 총 면적 계산 (buildingApiService 사용)
      const totalArea = buildingApiService.calculateTotalArea(unifiedData, floorUnits);


      setTotalUnitArea(totalArea);

      // 구조 및 지붕 정보는 useEffect에서 이미 설정했으므로 여기서는 설정하지 않음
      // (fetchMultipleUnitDetails는 면적 계산만 담당)

      // areaResult는 더 이상 사용하지 않지만 호환성을 위해 빈 배열 설정
      setAreaResult([]);

    } catch (err) {
      console.error("면적 정보 처리 오류:", err);
      setErrorModal({
        isOpen: true,
        message: "면적 정보를 처리하는데 실패했습니다."
      });
    } finally {
      setIsLoadingArea(false);
    }
  };

  // 컴포넌트 마운트 시 Context에서 데이터 불러오기
  useEffect(() => {
    setIsInitialLoading(true);

    const contextBuildingData = buildingData;
    const contextSelectedOption = facilityData.selectedBuildingType;
    const contextSelectedFloorUnits = facilityData.selectedFloorUnits;
    const contextSelectedDong = facilityData.selectedDong;

    // floors 배열에서 실제 지상층수 계산
    const getActualGrndFlrCnt = (title) => {
      if (!title?.floors) return title?.grndFlrCnt || 0;
      const grndFloors = title.floors.filter(f => f.flrGbCd === "20");
      return grndFloors.length > 0 ? grndFloors.length : (title.grndFlrCnt || 0);
    };

    // 가장 지상층수가 많은 동 찾기
    const getMaxGrndFlrTitle = (titlesArr) => {
      if (!titlesArr || titlesArr.length === 0) return null;
      return titlesArr.reduce((max, t) =>
        getActualGrndFlrCnt(t) > getActualGrndFlrCnt(max) ? t : max
        , titlesArr[0]);
    };

    // unifiedApiData에서 titles 배열 직접 가져오기
    if (contextBuildingData?.unifiedApiData) {
      const titles = contextBuildingData.unifiedApiData.data?.registryInfo?.titles || [];
      const addressInfo = contextBuildingData.unifiedApiData.data?.addressInfo || {};
      let targetTitle = null;


      // 선택된 동에 따라 title 찾기
      if (contextSelectedOption === "total" && contextSelectedDong) {
        // 건물전체 (단일 동 선택) - dongNm → bldNm → mainAtchGbCdNm fallback 적용
        targetTitle = titles.find(t => {
          const titleDongName = t.dongNm?.trim() || t.bldNm?.trim() || t.mainAtchGbCdNm?.trim();
          return titleDongName === contextSelectedDong;
        });
      } else if (contextSelectedOption === "all-buildings") {
        // 여러건물전체: 가장 낮은 등급을 가진 동의 정보 사용
        targetTitle = buildingApiService.getLowestGradeBuildingInfo(contextBuildingData.unifiedApiData);
        if (!targetTitle) {
          // 등급 정보가 없으면 첫 번째 동 사용
          targetTitle = titles[0];
        }
        // 여러건물전체 선택 시 안내 모달 표시 (한 번만)
        if (!noticeModalShownRef.current) {
          setIsNoticeModalOpen(true);
          noticeModalShownRef.current = true;
        }
      } else if (contextSelectedFloorUnits && contextSelectedFloorUnits.length > 0) {
        // 단층/여러층: 선택된 첫 번째 층의 동 정보 사용 - dongNm → bldNm → mainAtchGbCdNm fallback 적용
        const firstFloorUnit = contextSelectedFloorUnits[0];
        targetTitle = titles.find(t => {
          const titleDongName = t.dongNm?.trim() || t.bldNm?.trim() || t.mainAtchGbCdNm?.trim();
          return titleDongName === firstFloorUnit.dong;
        });
      }

      // targetTitle이 없으면 첫 번째 title 사용
      if (!targetTitle && titles.length > 0) {
        targetTitle = titles[0];
      }

      // 직접 데이터 설정 (변환 없이)
      if (targetTitle) {
        const buildingInfoData = {
          sigunguCd: addressInfo.sigunguCd,
          bjdongCd: addressInfo.bjdongCd,
          bun: addressInfo.bun,
          ji: addressInfo.ji,
          grndFlrCnt: contextSelectedOption === "all-buildings"
            ? getActualGrndFlrCnt(getMaxGrndFlrTitle(titles))
            : getActualGrndFlrCnt(targetTitle),
          ugrndFlrCnt: targetTitle.ugrndFlrCnt || 0,
          totArea: (contextSelectedOption === "total" && titles.length > 1)
            ? (targetTitle.totDongTotArea || addressInfo.totArea || 0)
            : (addressInfo.totArea || 0),
          strctCdNm: targetTitle.strctCdNm || "",
          roofCdNm: targetTitle.roofCdNm || "",
          regstrGbCdNm: addressInfo.regstrGbCdNm,
          mainPurpsCdNm: addressInfo.mainPurpsCdNm,
          fireGrade: targetTitle.fireGrade || ""
        };


        setBuildingInfo(buildingInfoData);

        // Context에도 층수 정보 저장
        updateBuildingData({
          grndFlrCnt: contextSelectedOption === "all-buildings"
            ? getActualGrndFlrCnt(getMaxGrndFlrTitle(titles))
            : getActualGrndFlrCnt(targetTitle),
          ugrndFlrCnt: targetTitle.ugrndFlrCnt || 0,
          titleInfo: buildingInfoData
        });

        const structValue = targetTitle.strctCdNm || "";
        const roofValue = targetTitle.roofCdNm || "";


        setStructInfo(structValue);
        setRoofInfo(roofValue);

        // 전체(total, all-buildings) 선택 옵션인 경우만 totArea 설정
        if (contextSelectedOption === "total") {
          // 건물전체 (단일 동 선택)
          setTotalUnitArea(targetTitle.totDongTotArea || 0);
        } else if (contextSelectedOption === "all-buildings") {
          // Context에 건물등급 저장
          const lowestFireGrade = buildingApiService.getLowestFireGradeForAllBuildings(contextBuildingData.unifiedApiData);
          updateBuildingData({
            bldgGrd: lowestFireGrade
          });

          setTotalUnitArea(addressInfo.totArea || targetTitle.totDongTotArea || 0);
        }
      } else {
      }
    }

    setSelectedOption(contextSelectedOption || "");

    // 선택된 여러 층과 호수 정보 설정
    if (contextSelectedFloorUnits && contextSelectedFloorUnits.length > 0) {
      setSelectedFloorUnits(contextSelectedFloorUnits);
      // 여러 층과 호수에 대한 정보 가져오기 (단층 또는 여러층 선택 시)
      if (contextSelectedOption === "single-floor" || contextSelectedOption === "multiple-floors") {
        // 디버깅: selectedFloorUnits 구조 확인
        console.log("=== ResultDisplay selectedFloorUnits ===");
        console.log("contextSelectedFloorUnits:", JSON.stringify(contextSelectedFloorUnits, null, 2));
        console.log("API totArea:", contextBuildingData?.unifiedApiData?.data?.addressInfo?.totArea);

        fetchMultipleUnitDetails(contextBuildingData, contextSelectedFloorUnits);
      }
    }

    setIsInitialLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    buildingData?.unifiedApiData,
    facilityData.selectedBuildingType,
    facilityData.selectedFloorUnits,
    facilityData.selectedDong
  ]);

  // 전체 면적 계산
  const totalArea = buildingInfo?.totArea || 0;
  const totalAreaInKoreanUnit = convertToKoreanUnit(totalArea);
  const totalUnitAreaInKoreanUnit = convertToKoreanUnit(totalUnitArea);

  // 층 및 호실 정보 계산
  const { floorCount, floorDisplay, unitCount } = useMemo(() => {
    if (selectedOption === "all-buildings") {
      return {
        floorCount: "전체",
        floorDisplay: "전체",
        unitCount: "전체",
      };
    }
    if (selectedOption === "total") {
      return {
        floorCount: "전체",
        floorDisplay: `${buildingInfo?.grndFlrCnt || 0}개 층`,
        unitCount: "전체",
      };
    }

    if (!selectedFloorUnits || selectedFloorUnits.length === 0) {
      return { floorCount: 0, floorDisplay: "미선택", unitCount: 0 };
    }

    // 고유한 층수 개수
    const uniqueFloors = new Set(selectedFloorUnits.map((item) => item.floor));

    const floorDisplay =
      selectedFloorUnits
        .map((item) => {
          return item.floor.flrGbCdNm === "지하"
            ? `지하 ${item.floor.flrNo}층`
            : item.floor.flrNo;
        })
        .join(", ") + " 층";

    // 총 호수 개수
    let totalUnits = 0;
    selectedFloorUnits.forEach((item) => {
      totalUnits += item.units.length;
    });

    return {
      floorCount: uniqueFloors.size,
      floorDisplay,
      unitCount: totalUnits,
    };
  }, [selectedOption, selectedFloorUnits, buildingInfo]);

  // 헤더 뒤로가기 핸들러
  const handleHeaderBack = () => {
    // 외벽 선택 모달이 열려있으면 모달만 닫고 Result 페이지 UI로 복귀
    if (isExteriorWallModalOpen) {
      setIsExteriorWallModalOpen(false);
      return;
    }

    // Result 페이지에서 뒤로가기 시 주소 검색 페이지로 이동
    navigate("/addressSearch");
  };

  return (
    <>
      <DisasterHeader
        title="실손보상 소상공인 풍수해·지진재해보험"
        onBack={handleHeaderBack}
      />
      {(isLoadingArea || isInitialLoading) && <Loading />}
      {isExteriorWallModalOpen ? (
        <ExteriorWall
          onSelect={handleWallSelect}
          onClose={() => setIsExteriorWallModalOpen(false)}
        />
      ) : (
        <div id={styles.AddressContainer}>
          <div className={styles.AddressContainerWrap}>
            <section className={styles.titleSection}>
              <div className={styles.title}>
                <h2 className={styles.mainTitle}>
                  실손보상 소상공인 풍수해·지진재해보험{" "}
                </h2>
              </div>
            </section>
            <section className={styles.searchSection}>
              <div className={styles.imagesWrap}>
                <img src={peoples} alt="peoples" />
              </div>
              <div className={styles.searchContents}>
                <div className={styles.governmentSupportWrap}>
                  <div className={styles.governmentSupport}>
                    <p>국가 및 지자체 지원 보험</p>
                    <img src={coverageSupport} alt="coverageSupport" />
                  </div>
                </div>
                <div className={styles.searchBox}>
                  <div className={styles.customInputWrap}>
                    <div className={styles.customInput}>
                      <p className={styles.addressText}>
                        {(() => {
                          // 1. 전유부(호실)가 있는 경우: unit의 fullNewPlatPlc 사용
                          if (facilityData?.selectedFloorUnits && facilityData.selectedFloorUnits.length > 0) {
                            const firstUnit = facilityData.selectedFloorUnits[0]?.units?.[0];
                            if (firstUnit?.fullNewPlatPlc) {
                              return firstUnit.fullNewPlatPlc;
                            }
                          }

                          // 2. 전유부가 없는 경우: info API의 newPlatPlc 사용
                          const addressInfo = buildingData?.unifiedApiData?.data?.addressInfo;
                          if (addressInfo?.newPlatPlc) {
                            return addressInfo.newPlatPlc;
                          }

                          // 3. 폴백
                          return "주소 정보 없음";
                        })()}
                      </p>
                      <span onClick={handleReSearch} style={{ cursor: "pointer" }}>
                        재검색
                      </span>
                    </div>

                    {/* m² 표시 (선택 / 전체) */}
                    <div className={styles.buildInfoContents}>
                      <div className={styles.infoDetail}>
                        <p>
                          {selectedOption === "total"
                            ? formatNumber(totalArea)
                            : formatNumber(totalUnitArea)}
                        </p>
                        <span>m²</span>
                      </div>
                      <div className={styles.infoDetail}>
                        <p>{formatNumber(totalArea)}</p>
                        <span>(전체)m²</span>
                      </div>
                    </div>

                    {/* 평수 표시 (선택 / 전체) */}
                    <div className={styles.buildInfoContents}>
                      <div className={styles.infoDetail}>
                        <p>
                          {selectedOption === "total"
                            ? formatNumber(totalAreaInKoreanUnit)
                            : formatNumber(totalUnitAreaInKoreanUnit)}
                        </p>
                        <span>평수</span>
                      </div>
                      <div className={styles.infoDetail}>
                        <p>{formatNumber(totalAreaInKoreanUnit)}</p>
                        <span>(전체)평수</span>
                      </div>
                    </div>

                    {/* 층수 정보 표시 */}
                    <div className={styles.buildInfoContents}>
                      <div className={styles.infoDetail}>
                        <p>{floorCount}</p>
                        <span>개층</span>
                      </div>
                      <div className={styles.infoDetail}>
                        <p>{buildingInfo?.grndFlrCnt || 0}</p>
                        <span>(전체)층수</span>
                      </div>
                    </div>

                    {/* 선택된 층수와 호수 표시 */}
                    <div className={styles.totalFloor}>
                      <p>{floorDisplay}</p>
                      {selectedOption !== "total" && unitCount > 0 && (
                        <p>({unitCount}개 호실)</p>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.selecteStructure}>
                  <ul>
                    <li>
                      <p>기둥</p>
                      <span className={styles.structureValue}>{structInfo}</span>
                    </li>
                    <li>
                      <p>지붕</p>
                      <span className={styles.structureValue}>{roofInfo}</span>
                    </li>
                    <li
                      onClick={openExteriorWallModal}
                      style={{ cursor: "pointer" }}
                    >
                      <p>외벽</p>
                      {exteriorWallType ? (
                        wallTypeNames[exteriorWallType]
                      ) : (
                        <span className={styles.selectCta}>
                          선택해주세요
                          {/* <img src={fingerClick} alt="click" className={styles.fingerIcon} /> */}
                        </span>
                      )}
                    </li>
                  </ul>
                </div>
                <div className={styles.btnWrap}>
                  <button
                    className={`${styles.nextBtn} ${isButtonDisabled() ? styles.disabledBtn : ""
                      }`}
                    disabled={isButtonDisabled()}
                    onClick={handleSearchClick}
                  >
                    {exteriorWallType ? "간편조회하기" : "확인하기"}
                  </button>
                </div>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* ChkModal 컴포넌트 추가 */}
      <ChkModal
        isFirstModalOpen={isFirstModalOpen}
        isSecondModalOpen={isSecondModalOpen}
        onCloseFirstModal={closeFirstModal}
        onCloseSecondModal={closeSecondModal}
        onConfirmFirst={handleFirstConfirm}
        onConfirmSecond={handleSecondConfirm}
        areaResult={areaResult}
      />

      {/* Question 모달 컴포넌트 추가 */}
      <Question
        isOpen={isQuestionModalOpen}
        onClose={closeQuestionModal}
        areaResult={areaResult}
      />

      {/* ErrorModal 추가 */}
      {errorModal.isOpen && (
        <ErrorModal
          message={errorModal.message}
          onClose={() => setErrorModal({ isOpen: false, message: "" })}
        />
      )}

      {/* NoticeModal 추가 - 여러건물전체 안내 */}
      <NoticeModal
        isOpen={isNoticeModalOpen}
        onClose={() => setIsNoticeModalOpen(false)}
        onReSearch={handleNoticeReSearch}
      />
    </>
  );
}

export default ResultDisplay;
