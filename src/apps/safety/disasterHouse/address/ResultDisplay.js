import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../../css/disasterHouse/result.module.css";
import coverageSupport from "../../../../assets/safeGuard-support.svg";
import addressHouse from "../../../../assets/address-house.png";
import ExteriorWall from "../../disasterSafeguard/address/ExteriorWall";
import { useDisasterHouse } from "../../../../context/DisasterHouseContext";
import { useSessionState } from "../../hooks/useSessionState";
import Loading from "../../../../components/loadings/Loading";
import DisasterHeader from "../../../../components/headers/DisasterHeader";
import ErrorModal from "../../../../components/modals/ErrorModal";
import ChkModal from "../../components/ChkModal";

function ResultDisplay() {
  const navigate = useNavigate();
  const { buildingData, facilityData, updateFacilityData, updateBuildingData } = useDisasterHouse();

  const [buildingInfo, setBuildingInfo] = useState(null);
  const [selectedFloorUnits, setSelectedFloorUnits] = useState([]);
  const [totalUnitArea, setTotalUnitArea] = useState(0);
  const [roofInfo, setRoofInfo] = useState("");
  const [structInfo, setStructInfo] = useState("");

  // 외벽 선택 관련 상태
  const [isExteriorWallModalOpen, setIsExteriorWallModalOpen] = useState(false);
  const [exteriorWallType, setExteriorWallType] = useSessionState(facilityData.exteriorWallType, "");

  const [isLoadingArea, setIsLoadingArea] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

  // ChkModal 상태
  const [isFirstModalOpen, setIsFirstModalOpen] = useState(false);
  const [isSecondModalOpen, setIsSecondModalOpen] = useState(false);

  // 외벽 타입 이름 매핑
  const wallTypeNames = {
    concrete: "콘크리트",
    brick: "조적 (벽돌,석조)",
    wood: "목재",
    panel: "샌드위치패널",
    unknown: "잘 모르겠어요",
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

  // 외벽 선택 모달 열기
  const openExteriorWallModal = () => setIsExteriorWallModalOpen(true);

  // ChkModal 핸들러
  const openFirstModal = () => setIsFirstModalOpen(true);
  const closeFirstModal = () => setIsFirstModalOpen(false);
  const closeSecondModal = () => setIsSecondModalOpen(false);

  // 첫 번째 모달 확인 버튼 핸들러 - 다음 페이지로 이동
  const handleFirstConfirm = () => {
    closeFirstModal();
    // 보험일자 선택 페이지로 이동
    navigate("/insuranceDate");
  };

  // 두 번째 모달 확인 버튼 핸들러 (외벽 모달에서 사용)
  const handleSecondConfirm = () => {
    closeSecondModal();
  };

  // 외벽 선택 핸들러
  const handleWallSelect = (wallType) => {
    setExteriorWallType(wallType);

    // 건물등급 결정
    const determineBuildingGrade = (exteriorType) => {
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

  // 재검색 버튼 클릭 핸들러
  const handleReSearch = () => {
    // 건물/시설 관련 데이터 초기화
    updateFacilityData({
      selectedFloorUnits: [],
      selectedDong: null,
      area: null,
      buildingUnitsData: null,
      exteriorWallType: ""
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
    navigate("/address/search");
  };

  // 다음 버튼 클릭 핸들러
  const handleSearchClick = () => {
    // 외벽 미선택 시 외벽 선택 모달 열기
    if (!exteriorWallType) {
      openExteriorWallModal();
      window.scrollTo(0, 0);
      return;
    }

    // 면적 정보를 Context에 저장
    updateFacilityData({ area: totalUnitArea });

    // 확인 모달 열기
    openFirstModal();
  };

  // 컴포넌트 마운트 시 Context에서 데이터 불러오기 및 면적 계산
  useEffect(() => {
    const initializeData = async () => {
      setIsInitialLoading(true);

      const contextBuildingData = buildingData;
      const contextSelectedFloorUnits = facilityData.selectedFloorUnits;
      const contextSelectedDong = facilityData.selectedDong;

      // unifiedApiData에서 titles 배열 직접 가져오기
      if (contextBuildingData?.unifiedApiData) {
        const titles = contextBuildingData.unifiedApiData.data?.registryInfo?.titles || [];
        const addressInfo = contextBuildingData.unifiedApiData.data?.addressInfo || {};
        let targetTitle = null;

        // 선택된 동에 따라 title 찾기
        if (contextSelectedDong) {
          targetTitle = titles.find(t => {
            const titleDongName = t.dongNm?.trim() || t.bldNm?.trim() || t.mainAtchGbCdNm?.trim();
            return titleDongName === contextSelectedDong;
          });
        }

        // targetTitle이 없으면 첫 번째 title 사용
        if (!targetTitle && titles.length > 0) {
          targetTitle = titles[0];
        }

        // 직접 데이터 설정
        if (targetTitle) {
          // floors 배열에서 실제 지상층수 계산
          const getActualGrndFlrCnt = (title) => {
            if (!title?.floors) return title?.grndFlrCnt || 0;
            const grndFloors = title.floors.filter(f => f.flrGbCd === "20");
            return grndFloors.length > 0 ? grndFloors.length : (title.grndFlrCnt || 0);
          };

          const buildingInfoData = {
            sigunguCd: addressInfo.sigunguCd,
            bjdongCd: addressInfo.bjdongCd,
            bun: addressInfo.bun,
            ji: addressInfo.ji,
            grndFlrCnt: getActualGrndFlrCnt(targetTitle),
            ugrndFlrCnt: targetTitle.ugrndFlrCnt || 0,
            totArea: addressInfo.totArea || targetTitle.totArea || 0,
            strctCdNm: targetTitle.strctCdNm || "",
            roofCdNm: targetTitle.roofCdNm || "",
            regstrGbCdNm: addressInfo.regstrGbCdNm,
            mainPurpsCdNm: addressInfo.mainPurpsCdNm,
            fireGrade: targetTitle.fireGrade || ""
          };

          setBuildingInfo(buildingInfoData);

          // Context에도 층수 정보 저장
          updateBuildingData({
            grndFlrCnt: getActualGrndFlrCnt(targetTitle),
            ugrndFlrCnt: targetTitle.ugrndFlrCnt || 0,
            titleInfo: buildingInfoData,
            bldgGrd: targetTitle.fireGrade || ""
          });

          setStructInfo(targetTitle.strctCdNm || "");
          setRoofInfo(targetTitle.roofCdNm || "");
        }
      }

      // 선택된 층과 호수 정보 설정 및 면적 계산
      if (facilityData.isDetachedHouse && facilityData.area) {
        // 단독주택: Context에서 직접 면적 가져오기 (동 전체 면적)
        setTotalUnitArea(facilityData.area);
      } else if (contextSelectedFloorUnits && contextSelectedFloorUnits.length > 0) {
        setSelectedFloorUnits(contextSelectedFloorUnits);

        // 선택된 층/호수들의 면적 합계 계산
        let totalArea = 0;
        let useBuildingArea = false;

        contextSelectedFloorUnits.forEach(floorUnit => {
          if (floorUnit.units && floorUnit.units.length > 0) {
            // 호실 정보가 있는 경우: 호실들의 면적 합계
            floorUnit.units.forEach(unit => {
              totalArea += unit.area || 0;
            });
          } else {
            // 호실 정보가 없는 경우: 건물(동)의 totDongTotArea 사용 (floor.area는 바닥면적이라 부적합)
            useBuildingArea = true;
          }
        });

        // 호실 없이 층만 선택한 경우, 해당 건물의 totDongTotArea 사용
        if (useBuildingArea && totalArea === 0) {
          const titles = contextBuildingData?.unifiedApiData?.data?.registryInfo?.titles || [];
          const selectedDong = contextSelectedDong;

          let targetTitle = titles[0];
          if (selectedDong) {
            const found = titles.find(t => {
              const dongName = t.dongNm?.trim() || t.bldNm?.trim() || t.mainAtchGbCdNm?.trim();
              return dongName === selectedDong;
            });
            if (found) targetTitle = found;
          }

          totalArea = targetTitle?.totDongTotArea || targetTitle?.totArea || 0;
        }

        setTotalUnitArea(totalArea);
      }

      setIsInitialLoading(false);
    };

    initializeData();
  }, [buildingData, facilityData]);

  // 전체 면적 계산
  const totalArea = buildingInfo?.totArea || 0;
  const totalAreaInKoreanUnit = convertToKoreanUnit(totalArea);
  const totalUnitAreaInKoreanUnit = convertToKoreanUnit(totalUnitArea);

  // 층 및 호실 정보 계산
  const { floorCount, floorDisplay, unitCount } = useMemo(() => {
    // 단독주택인 경우 "전체" 표시
    if (facilityData.isDetachedHouse) {
      const titles = buildingData?.unifiedApiData?.data?.registryInfo?.titles || [];
      const selectedDong = facilityData.selectedDong;

      // 선택한 동의 title 찾기 (없으면 첫 번째 title 사용)
      let targetTitle = titles[0];
      if (selectedDong) {
        const found = titles.find(t => {
          const dongName = t.dongNm?.trim() || t.bldNm?.trim() || t.mainAtchGbCdNm?.trim();
          return dongName === selectedDong;
        });
        if (found) targetTitle = found;
      }

      const grndFlrCnt = targetTitle?.grndFlrCnt || buildingData?.grndFlrCnt || 1;
      return {
        floorCount: grndFlrCnt,
        floorDisplay: "전체",
        unitCount: 0
      };
    }

    if (!selectedFloorUnits || selectedFloorUnits.length === 0) {
      return { floorCount: 0, floorDisplay: "미선택", unitCount: 0 };
    }

    // 고유한 층수 개수
    const uniqueFloors = new Set(selectedFloorUnits.map((item) =>
      `${item.floor.flrGbCdNm}-${item.floor.flrNo}`
    ));

    const floorDisplay =
      selectedFloorUnits
        .map((item) => {
          return item.floor.flrGbCdNm === "지하"
            ? `지하 ${item.floor.flrNo}층`
            : `${item.floor.flrNo}층`;
        })
        .join(", ");

    // 총 호수 개수
    let totalUnits = 0;
    selectedFloorUnits.forEach((item) => {
      totalUnits += item.units?.length || 0;
    });

    return {
      floorCount: uniqueFloors.size,
      floorDisplay,
      unitCount: totalUnits,
    };
  }, [selectedFloorUnits, facilityData.isDetachedHouse, buildingData]);

  // 버튼 비활성화 조건
  const isButtonDisabled = () => {
    if (!structInfo || structInfo.trim() === "") return true;
    if (!roofInfo || roofInfo.trim() === "") return true;

    // 단독주택이 아닌 경우에만 층 선택 체크
    if (!facilityData.isDetachedHouse) {
      if (floorCount === 0 || floorDisplay === "미선택") return true;
    }

    // 외벽 선택 후에만 면적 검증
    if (exteriorWallType) {
      if (!totalUnitArea || totalUnitArea <= 0) return true;
    }

    return false;
  };

  // 헤더 뒤로가기 핸들러
  const handleHeaderBack = () => {
    // 외벽 선택 모달이 열려있으면 모달만 닫고 Result 페이지 UI로 복귀
    if (isExteriorWallModalOpen) {
      setIsExteriorWallModalOpen(false);
      return;
    }

    if (facilityData.isDetachedHouse) {
      // 다중 건물 단독주택(동 선택을 거쳐 온 경우) → 동 선택 페이지로
      const titleCnt = buildingData?.unifiedApiData?.data?.registryInfo?.titleCnt || 0;
      if (titleCnt > 1) {
        navigate("/address/dong");
      } else {
        // 단일 건물 단독주택 → 주소검색 페이지로
        navigate("/address/search");
      }
    } else {
      navigate("/address/floor");
    }
  };

  return (
    <>
      <DisasterHeader
        title="실손보상 주택 풍수해·지진재해보험"
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
                  실손 비례보상 주택 풍수해 지진재해 보험
                </h2>
              </div>
            </section>
            <section className={styles.searchSection}>
              <div className={styles.imagesWrap}>
                <img src={addressHouse} alt="house" />
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
                            if (firstUnit?.fullNewPlatPlc && firstUnit.fullNewPlatPlc.trim()) {
                              return firstUnit.fullNewPlatPlc;
                            }
                          }

                          // 2. 전유부가 없는 경우: info API의 newPlatPlc 사용 (공백이 아닌 경우만)
                          const addressInfo = buildingData?.unifiedApiData?.data?.addressInfo;
                          if (addressInfo?.newPlatPlc && addressInfo.newPlatPlc.trim()) {
                            return addressInfo.newPlatPlc;
                          }

                          // 3. newPlatPlc이 없거나 공백인 경우: platPlc 사용
                          if (addressInfo?.platPlc && addressInfo.platPlc.trim()) {
                            return addressInfo.platPlc;
                          }

                          // 4. Context에 저장된 주소 사용
                          if (buildingData?.lctnAdr) {
                            return buildingData.lctnAdr;
                          }

                          // 5. 폴백
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
                        <p>{formatNumber(totalUnitArea)}</p>
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
                        <p>{formatNumber(totalUnitAreaInKoreanUnit)}</p>
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
                      {unitCount > 0 && (
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
                        </span>
                      )}
                    </li>
                  </ul>
                </div>
                <div className={styles.btnWrap}>
                  <button
                    className={`${styles.nextBtn} ${isButtonDisabled() ? styles.disabledBtn : ""}`}
                    disabled={isButtonDisabled()}
                    onClick={handleSearchClick}
                  >
                    {exteriorWallType ? "다음으로" : "확인하기"}
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
      />

      {/* ErrorModal 추가 */}
      {errorModal.isOpen && (
        <ErrorModal
          message={errorModal.message}
          onClose={() => setErrorModal({ isOpen: false, message: "" })}
        />
      )}
    </>
  );
}

export default ResultDisplay;
