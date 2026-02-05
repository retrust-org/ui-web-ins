import { useState } from "react";
import SafetyButton from "../../../../components/buttons/SafetyButton";
import styles from "../../../../css/disasterSafeguard/selectedPrice.module.css";
import LandlordPrice from "../components/LandlordPrice";
import { useDisasterInsurance } from "../../../../context/DisasterInsuranceContext";
import { useSessionState } from "../../hooks/useSessionState";
import { useSession } from "../../../../context/SessionContext";
import Result from "./Result";
import Loading from '../../../../components/loadings/Loading'
import ErrorModal from '../../../../components/modals/ErrorModal'
import DisasterHeader from "../../../../components/headers/DisasterHeader";
import csrfManager from "../../../../utils/csrfTokenManager";
import { getSessionToken } from "../../services/consentService";
import { checkApiError } from "../../../../utils/checkApiError";

function Selectedprice() {

  const { facilityData, businessData, buildingData, coverageAmounts, premiumData, setPremiumData, updateCoverageAmounts, contractData } = useDisasterInsurance();
  // V3 API: sessionToken 통합
  const { setSessionToken } = useSession();

  // 사용자 타입 구분
  const isOwner = facilityData.owsDivCon === "소유자";
  const isMerchant = businessData.tngDivCd === "20";

  // sessionStorage에서 복원, 기본값은 "추천"
  const [activeFilter, setActiveFilter] = useSessionState(coverageAmounts.activeFilter, "추천");
  const [showResultModal, setShowResultModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "", subMsg: "" });

  // sessionToken 발급 함수
  // V3 API: sessionToken 통합 - 보험료 조회할 때마다 새로운 sessionToken 발급
  const fetchSessionToken = async () => {
    try {
      // disaster-business: 재해보험 사업자용 (20개 동의 필요)
      const result = await getSessionToken('disaster-business');
      setSessionToken(result.sessionToken, result.expiresAt);

      console.log('sessionToken 발급 완료 (disaster-business):', result.sessionToken);
      return result.sessionToken;
    } catch (error) {
      console.error("sessionToken 발급 실패:", error);
      throw error;
    }
  };

  const handleFilterClick = (filterType) => {
    setActiveFilter(filterType);

    // 직접선택 버튼 클릭 시 모든 값을 500만원(5000000원)으로 초기화
    // 단, 임차인의 건물가입금액과 소상인의 설치기계가입금액은 0 유지
    if (filterType === "직접선택") {
      updateCoverageAmounts({
        bldgSbcAmt: isOwner ? 5000000 : 0,           // 임차인은 0 유지
        fclSbcAmt: 5000000,
        invnAsetSbcAmt: 5000000,
        instlMachSbcAmt: isMerchant ? 0 : 5000000,   // 소상인은 0 유지
        activeFilter: filterType
      });
    } else {
      // 추천 또는 럭셔리 선택 시에도 activeFilter 저장
      updateCoverageAmounts({
        activeFilter: filterType
      });
    }
  };

  // Range Input 자동 변경 시 호출 (버튼 클릭으로 인한 변경)
  const handleRangeChange = (updatedAmounts, isManual) => {
    // 수동 조절이 아니면 그냥 값만 업데이트 (필터 변경 없음)
    if (!isManual) {
      updateCoverageAmounts(updatedAmounts);
      return;
    }

    // 수동 조절인 경우 직접선택으로 전환
    if (activeFilter !== "직접선택") {
      setActiveFilter("직접선택");
      updateCoverageAmounts({
        ...updatedAmounts,
        activeFilter: "직접선택"
      });
    } else {
      updateCoverageAmounts(updatedAmounts);
    }
  };

  // Premium API 호출
  const handleFetchPremium = async () => {
    try {
      setIsLoading(true);

      // 필수 데이터 확인
      if (!facilityData.polhdCusTpCd || !facilityData.sfdgFclTpCd || !facilityData.owsDivCon) {
        throw new Error("필요한 시설 데이터가 누락되었습니다.");
      }

      if (!businessData.polhdNm || !businessData.polhdBizpeNo) {
        throw new Error("필요한 사업자 데이터가 누락되었습니다.");
      }

      // 가입면적 확인
      if (facilityData.area === null || facilityData.area === undefined || facilityData.area <= 0) {
        throw new Error("가입면적 정보가 없습니다. 건물 정보를 다시 확인해주세요.");
      }

      // 지하 유무 확인: 전체 건물 선택 시 건물 데이터로 확인, 그 외에는 선택된 층으로 확인
      const isWholeBuildingType = ["total", "all-buildings"].includes(facilityData.selectedBuildingType);

      const undgSiteYn = isWholeBuildingType
        ? (buildingData.ugrndFlrCnt > 0 ? "1" : "2")
        : (facilityData.selectedFloorUnits?.some(item => item.floor.flrGbCdNm === "지하") ? "1" : "2");

      console.log("=== undgSiteYn 판단 로그 (Premium API) ===");
      console.log("건물 타입:", facilityData.selectedBuildingType);
      console.log("전체 건물 여부:", isWholeBuildingType);
      if (isWholeBuildingType) {
        console.log("지하 층수 (ugrndFlrCnt):", buildingData.ugrndFlrCnt);
      } else {
        console.log("선택된 층:", facilityData.selectedFloorUnits?.map(item => ({
          flrGbCdNm: item.floor.flrGbCdNm,
          flrNo: item.floor.flrNo
        })));
      }
      console.log("최종 undgSiteYn:", undgSiteYn, undgSiteYn === "1" ? "(지하 있음)" : "(지하 없음)");
      console.log("=========================================");

      // Context에 저장된 건물등급 사용
      const bldgGrd = buildingData.bldgGrd || "";

      // 임차인일 경우 건물가입금액 0으로 처리
      const buildingAmount = isOwner ? coverageAmounts.bldgSbcAmt : 0;

      // 소상인일 경우 설치기계가입금액 0으로 처리
      const installationMachineAmount = isMerchant ? 0 : coverageAmounts.instlMachSbcAmt;

      // 보험 날짜 (contractData에서 가져옴, 없으면 기본값 사용)
      const getDefaultDates = () => {
        const today = new Date();
        const start = new Date(today);
        start.setDate(today.getDate() + 7);  // 오늘 + 7일

        const end = new Date(start);
        end.setFullYear(start.getFullYear() + 1);  // 개시일 + 1년

        const formatDate = (date) => {
          const year = date.getFullYear();
          const month = String(date.getMonth() + 1).padStart(2, '0');
          const day = String(date.getDate()).padStart(2, '0');
          return `${year}${month}${day}`;
        };

        return {
          startDate: formatDate(start),
          endDate: formatDate(end)
        };
      };

      const defaultDates = getDefaultDates();
      const insBgnDt = contractData.startDate || defaultDates.startDate;
      const insEdDt = contractData.endDate || defaultDates.endDate;

      // 보험 적용 층수 계산
      const getInsuredFloorNumbers = () => {
        // 건물전체 또는 여러건물전체 선택 시
        if (facilityData.selectedBuildingType === "total" || facilityData.selectedBuildingType === "all-buildings") {
          return buildingData.grndFlrCnt.toString();
        }
        // 단층 or 여러층 선택 시
        if (facilityData.selectedFloorUnits?.length > 0) {
          return facilityData.selectedFloorUnits.map(item => {
            if (item.floor.flrGbCdNm === "지하") {
              return `지하${item.floor.flrNo}`;
            }
            return item.floor.flrNo;
          }).join(',');
        }
        // 기본값
        return buildingData.grndFlrCnt.toString();
      };

      const requestBody = {
        "pdCd": "17605",
        "insBgnDt": insBgnDt,
        "insEdDt": insEdDt,
        "tngDivCd": businessData.tngDivCd,
        "ekpfDsgYn": buildingData.earthquakeResistantDesign,
        "bldgDtlsCd": "01",
        "owbrAmt": 200000,
        "bldgSbcAmt": buildingAmount,
        "fclSbcAmt": coverageAmounts.fclSbcAmt,
        "hhgdFntrSbcAmt": 0,
        "invnAsetSbcAmt": coverageAmounts.invnAsetSbcAmt,
        "instlMachSbcAmt": installationMachineAmount,
        "polhdCusTpCd": facilityData.polhdCusTpCd && facilityData.polhdCusTpCd !== "" ? facilityData.polhdCusTpCd : "2",
        "inspeCusTpCd": facilityData.polhdCusTpCd && facilityData.polhdCusTpCd !== "" ? facilityData.polhdCusTpCd : "2",
        "owsDivCon": facilityData.owsDivCon,
        "sfdgFclTpCd": facilityData.sfdgFclTpCd,
        "insdSqme": facilityData.area.toString(),
        "polhdNm": businessData.polhdNm,
        "polhdBizpeNo": businessData.polhdBizpeNo,
        "gnrBizNm": businessData.companyName,  // 상호명
        "inspeNm": businessData.inspeNm,
        "inspeBizpeNo": businessData.inspeBizpeNo,
        "siNm": buildingData.siNm || "",
        "sggNm": buildingData.sggNm || "",
        "lctnAdr": buildingData.lctnAdr || "",  // 기본 주소만 사용 (호수 정보 제외)
        "bldgGndTtFlrNum": (buildingData.grndFlrCnt || 0).toString(),
        "bldgUndgTtFlrNum": (buildingData.ugrndFlrCnt || 0).toString(),
        "undgSiteYn": undgSiteYn,
        "bldgGrd": bldgGrd,
        "allFlrSbcYn": (facilityData.selectedBuildingType === "total" || facilityData.selectedBuildingType === "all-buildings") ? "1" : "2",
        "insdGndFlrNumVal": getInsuredFloorNumbers(),
        "sgbdTtySbcAmt": 0
      };

      // CSRF 토큰 가져오기 (자동 갱신)
      const csrfToken = await csrfManager.getToken();

      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/premium`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken
          },
          body: JSON.stringify(requestBody)
        }
      );

      // 403 에러 (CSRF 토큰 오류) 시 자동 재시도
      if (response.status === 403) {
        csrfManager.clearToken();
        const newToken = await csrfManager.getToken();

        const retryResponse = await fetch(
          `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/premium`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-CSRF-Token': newToken
            },
            body: JSON.stringify(requestBody)
          }
        );

        const { data: retryData } = await retryResponse.json();

        if (!checkApiError(retryData, setErrorModal)) return null;

        setPremiumData(retryData);
        return retryData;
      }

      const { data } = await response.json();

      if (!checkApiError(data, setErrorModal)) return null;

      setPremiumData(data);
      return data;

    } catch (error) {
      console.error("Premium API 호출 오류:", error);
      setErrorModal({
        isOpen: true,
        message: error.message || "보험료 조회 중 오류가 발생했습니다.",
        subMsg: "다시 시도해주세요."
      });
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleConfirmClick = async () => {
    try {
      setIsLoading(true);

      // 1. sessionToken 발급 (30분 유효) - 실패해도 보험료 계산은 진행
      try {
        await fetchSessionToken();
      } catch (tokenError) {
        console.warn("sessionToken 발급 실패 (보험료 계산은 계속 진행):", tokenError);
      }

      // 2. 화면에 표시되지 않는 항목은 0으로 초기화하여 Context에 저장
      updateCoverageAmounts({
        bldgSbcAmt: isOwner ? coverageAmounts.bldgSbcAmt : 0,
        instlMachSbcAmt: isMerchant ? 0 : coverageAmounts.instlMachSbcAmt
      });

      // 3. Premium API 호출 (sessionToken 불필요)
      await handleFetchPremium();

      // API 성공 후 모달 표시
      setShowResultModal(true);
    } catch (error) {
      console.error("보험료 조회 실패:", error);
      // 에러는 handleFetchPremium에서 이미 처리됨
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowResultModal(false);
  };

  const handleCloseErrorModal = () => {
    setErrorModal({ isOpen: false, message: "", subMsg: "" });
  };
  return (
    <>
      <DisasterHeader title="실손보상 소상공인 풍수해·지진재해보험" />
      <div className={styles.SelectedpriceContents}>
        <div className={styles.SelectedpriceContentsWrap}>
          <h2>
            원하시는 보장금액을
            <br /> 선택해주세요
          </h2>

          {/* 로딩 상태 표시 */}
          {isLoading && <Loading />}

          <div className={styles.planFilterBtn}>
            <ul>
              <li
                className={activeFilter === "추천" ? styles.active : ""}
                onClick={() => handleFilterClick("추천")}
              >
                추천
              </li>
              <li
                className={activeFilter === "럭셔리" ? styles.active : ""}
                onClick={() => handleFilterClick("럭셔리")}
              >
                럭셔리
              </li>
              <li
                className={activeFilter === "직접선택" ? styles.active : ""}
                onClick={() => handleFilterClick("직접선택")}
              >
                직접선택
              </li>
            </ul>
          </div>

          <LandlordPrice
            activeFilter={activeFilter}
            owsDivCon={facilityData.owsDivCon}
            tngDivCd={businessData.tngDivCd}
            onUpdateCoverageAmounts={handleRangeChange}
          />
          {/* <TenantPrice activeFilter={activeFilter} /> */}
        </div>
      </div>
      <SafetyButton buttonText="확인하기" onClick={handleConfirmClick} />

      {/* 결과 모달 */}
      {showResultModal && (
        <Result
          isOpen={showResultModal}
          onClose={handleCloseModal}
          premiumData={premiumData}
        />
      )}

      {/* 에러 모달 */}
      {errorModal.isOpen && (
        <ErrorModal
          message={errorModal.message}
          subMsg={errorModal.subMsg}
          onClose={handleCloseErrorModal}
        />
      )}
    </>
  );
}

export default Selectedprice;
