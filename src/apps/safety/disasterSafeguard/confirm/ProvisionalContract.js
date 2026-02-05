import { useState } from 'react';
import csrfManager from '../../../../utils/csrfTokenManager';

// Context 데이터를 가계약 API 요청 형식으로 변환하는 함수
const buildRequestBodyFromContext = (contextData) => {
    const { facilityData, businessData, buildingData, coverageAmounts, personalData, businessAddress, contractData } = contextData;

    return {
        // 고정값
        "pdCd": "17605",
        "owbrAmt": 200000,
        "hhgdFntrSbcAmt": 0,
        "sgbdTtySbcAmt": 0,
        "tngDivCd": businessData.tngDivCd,
        "ekpfDsgYn": "2",
        "bldgDtlsCd": "01",
        "agrInfCon": "111112",

        // Context에서 날짜 가져오기
        "insBgnDt": contractData.startDate,
        "insEdDt": contractData.endDate,

        // Context에서 직접 매핑
        "polhdCusTpCd": facilityData.polhdCusTpCd,
        "polhdNm": personalData.name, // 입력받은 계약자 이름 사용
        "gnrBizNm": businessData.companyName, // 상호명
        "polhdBizpeNo": businessData.polhdBizpeNo,
        "inspeCusTpCd": facilityData.polhdCusTpCd, // 계약자와 피보험자 동일
        "inspeNm": personalData.name, // 입력받은 계약자 이름 사용 (계약자=피보험자)
        "inspeBizpeNo": businessData.inspeBizpeNo,
        "siNm": buildingData.siNm,
        "sggNm": buildingData.sggNm,
        "lctnAdr": businessAddress,
        "owsDivCon": facilityData.owsDivCon,
        "sfdgFclTpCd": facilityData.sfdgFclTpCd,

        // 암호화된 개인정보 (V2 API)
        "encryptedFields": personalData.encryptedFields,

        // Context에 저장된 건물등급 사용
        "bldgGrd": buildingData.bldgGrd || "",
        "bldgGndTtFlrNum": buildingData.grndFlrCnt,
        "bldgUndgTtFlrNum": buildingData.ugrndFlrCnt,

        // 면적 정보
        "insdSqme": String(facilityData.area),

        // 조건부 계산
        // 지하 유무 확인: 전체 건물 선택 시 건물 데이터로 확인, 그 외에는 선택된 층으로 확인
        "undgSiteYn": (() => {
            const isWholeBuildingType = ["total", "all-buildings"].includes(facilityData.selectedBuildingType);
            const undgSiteYn = isWholeBuildingType
                ? (buildingData.ugrndFlrCnt > 0 ? "1" : "2")
                : (facilityData.selectedFloorUnits?.some(item => item.floor.flrGbCdNm === "지하") ? "1" : "2");

            console.log("=== undgSiteYn 판단 로그 (Provisional API) ===");
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
            console.log("============================================");

            return undgSiteYn;
        })(),
        "allFlrSbcYn": facilityData.selectedBuildingType === "total" ? "1" : "2",
        "insdGndFlrNumVal": facilityData.selectedBuildingType === "total"
            ? String(buildingData.grndFlrCnt || 1)
            : (facilityData.selectedFloorUnits.length > 0
                ? facilityData.selectedFloorUnits.map(item => {
                    if (item.floor.flrGbCdNm === "지하") {
                      return `지하${item.floor.flrNo}`;
                    }
                    return item.floor.flrNo;
                  }).join(',')
                : "1"),
        // 가입금액 (이미 원 단위로 저장되어 있음)
        "bldgSbcAmt": coverageAmounts.bldgSbcAmt,
        "fclSbcAmt": coverageAmounts.fclSbcAmt,
        "invnAsetSbcAmt": coverageAmounts.invnAsetSbcAmt,
        "instlMachSbcAmt": coverageAmounts.instlMachSbcAmt
    };
};

// 가계약 API 호출을 위한 커스텀 훅
export const useProvisionalContract = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [contractData, setContractData] = useState(null);
    const [error, setError] = useState(null);

    // 가계약 API 호출 함수
    const fetchProvisionalContract = async (contextData) => {
        try {
            setIsLoading(true);
            setError(null);

            // Context 데이터로 요청 body 생성
            const requestBody = buildRequestBodyFromContext(contextData);

            // CSRF 토큰 가져오기 (자동 갱신)
            const csrfToken = await csrfManager.getToken();

            // V3 API: sessionStorage에서 sessionToken 가져오기
            const sessionContext = JSON.parse(sessionStorage.getItem('session_context') || '{}');
            const sessionToken = sessionContext.sessionToken || '';

            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/premium/provisional`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken,
                        'X-Session-Token': sessionToken
                    },
                    body: JSON.stringify(requestBody)
                }
            );

            // 403 에러 (CSRF 토큰 오류) 시 자동 재시도
            if (response.status === 403) {
                console.log('⚠️ CSRF 토큰 오류 (403), 재발급 후 재시도...');
                csrfManager.clearToken();
                const newToken = await csrfManager.getToken();

                const retryResponse = await fetch(
                    `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/premium/provisional`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-Token': newToken,
                            'X-Session-Token': sessionToken
                        },
                        body: JSON.stringify(requestBody)
                    }
                );

                const retryResponseData = await retryResponse.json();

                const retryData = retryResponseData.data;

                // 재시도도 실패하면 에러
                if (!retryResponse.ok || (retryData.errCd && retryData.errCd !== "00001")) {
                    const error = new Error(retryData.errMsg || retryData.error?.message || "가계약 처리 중 오류가 발생했습니다.");
                    error.errCd = retryData.errCd;  // errCd를 에러 객체에 추가
                    throw error;
                }

                setContractData(retryData);
                return retryData;
            }

            const responseData = await response.json();
            const data = responseData.data;

            // errCd 체크 - "00001"이 아니면 에러
            if (data.errCd && data.errCd !== "00001") {
                // 에러 코드별 사용자 친화적 메시지
                let errorMessage = data.errMsg || "가계약 처리 중 오류가 발생했습니다.";

                // 특정 에러 코드별 메시지 처리
                if (data.errCd === "60019") {
                    errorMessage = "이미 가입된 건물/시설입니다.";
                } else if (data.errMsg) {
                    errorMessage = data.errMsg;
                }

                const error = new Error(errorMessage);
                error.errCd = data.errCd;  // errCd를 에러 객체에 추가
                throw error;
            }

            setContractData(data);
            return data;

        } catch (error) {
            console.error("가계약 API 호출 오류:", error);
            setError(error.message);
            throw error;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        contractData,
        error,
        fetchProvisionalContract
    };
};