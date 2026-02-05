import { useState } from 'react';
import csrfManager from '../../../../utils/csrfTokenManager';
import { checkApiError } from '../../../../utils/checkApiError';

// V1 테스트 모드 설정 (true: V1 평문, false: V2 암호화)
const USE_V1_API = false;

// Context 데이터를 가계약 API 요청 형식으로 변환하는 함수 (V2 암호화 버전)
const buildRequestBodyFromContext = (contextData) => {
    const { contractorType, businessData, buildingData, coverageAmounts, personalData, facilityData, contractData } = contextData;

    // 계약자 유형 코드 변환 (01: 개인 → 1, 02: 개인사업자 → 2, 03: 법인사업자 → 3)
    const getPolhdCusTpCd = () => {
        switch (contractorType) {
            case "02": return "2";  // 개인사업자
            case "03": return "3";  // 법인사업자
            default: return "1";    // 개인 (기본값)
        }
    };
    const polhdCusTpCd = getPolhdCusTpCd();
    const isBusiness = contractorType === "02" || contractorType === "03";

    // 소재지 주소 결정 (호실 정보가 있으면 fullNewPlatPlc, 없으면 buildingData.lctnAdr)
    const getLctnAdr = () => {
        if (facilityData?.selectedFloorUnits?.length > 0) {
            const firstUnit = facilityData.selectedFloorUnits[0]?.units?.[0];
            if (firstUnit?.fullNewPlatPlc) {
                return firstUnit.fullNewPlatPlc;
            }
        }
        return buildingData.lctnAdr || "";
    };

    // 기본 요청 객체 (API 스펙 순서에 맞춤)
    const requestBody = {
        "pdCd": "17604",  // 상품코드: 17604(주택)
        "insBgnDt": contractData.startDate,  // 보험개시일
        "insEdDt": contractData.endDate,  // 보험종료일
        "polhdCusTpCd": polhdCusTpCd,  // 계약자고객유형: 1:개인, 2:개인사업자, 3:법인사업자
        "polhdNm": personalData.name,  // 계약자명
        // 사업자일 때만 사업자번호 추가
        ...(isBusiness && businessData?.businessNumber && {
            "polhdBizpeNo": businessData.businessNumber
        }),
        "inspeCusTpCd": polhdCusTpCd,  // 피보험자고객유형 (계약자와 동일)
        "inspeNm": personalData.name,  // 피보험자명 (계약자와 동일)
        // 사업자일 때만 피보험자 사업자번호 추가
        ...(isBusiness && businessData?.businessNumber && {
            "inspeBizpeNo": businessData.businessNumber
        }),
        "sggNm": buildingData.sggNm,  // 시군구명
        "siNm": buildingData.siNm,  // 시명
        "lctnAdr": getLctnAdr(),  // 소재지주소
        "ekpfDsgYn": buildingData.earthquakeResistantDesign || "2",  // 내진설계여부: 1:예, 2:아니요
        "bldgDtlsCd": "01",  // 건물세부코드: 01:신축
        "bldgGrd": buildingData.bldgGrd || "",  // 건물급수
        "owsDivCon": "소유자",  // 소유구분 (주택은 소유자만 가입 가능)
        "undgSiteYn": (() => {
            const hasBasement = facilityData.selectedFloorUnits?.some(
                item => item.floor?.flrGbCdNm === "지하"
            );
            return hasBasement ? "1" : "2";
        })(),  // 지하소재여부: 1:예, 2:아니오
        "insdSqme": String(facilityData.area || ""),  // 가입면적
        "opjbCd": buildingData.opjbCd || "",  // 건물영위코드
        "sbcHshdNum": facilityData.unitCount || 1,  // 총세대수
        "allFlrSbcYn": "2",  // 전체층가입여부: 2:아니오
        "bldgGndTtFlrNum": buildingData.grndFlrCnt,  // 건물지상총층수
        "bldgUndgTtFlrNum": buildingData.ugrndFlrCnt,  // 건물지하총층수
        "insdGndFlrNumVal": (() => {
            // 선택된 층에서 지상층 번호 추출
            const selectedFloor = facilityData.selectedFloorUnits?.[0]?.floor;
            if (selectedFloor?.flrGbCdNm === "지상" && selectedFloor?.flrNoNm) {
                return String(selectedFloor.flrNoNm);
            }
            // 기본값: 건물 지상층수
            return String(buildingData.grndFlrCnt || 1);
        })(),  // 보험가입지상층수값
        "bldgSbcAmt": coverageAmounts.bldgSbcAmt,  // 건물가입금액
        "owbrAmt": 0,  // 자기부담금 (주택풍수해는 0)
        "sgbdTtySbcAmt": 0,  // 시설/집기 가입금액 (주택은 0)

        // 암호화된 개인정보 (V2 API)
        "encryptedFields": personalData.encryptedFields
    };

    return requestBody;
};

// V1 평문 버전 요청 body 생성 함수
const buildRequestBodyV1 = (contextData) => {
    const { contractorType, businessData, buildingData, coverageAmounts, personalData, facilityData, contractData } = contextData;

    // 계약자 유형 코드 변환 (01: 개인 → 1, 02: 개인사업자 → 2, 03: 법인사업자 → 3)
    const getPolhdCusTpCd = () => {
        switch (contractorType) {
            case "02": return "2";  // 개인사업자
            case "03": return "3";  // 법인사업자
            default: return "1";    // 개인 (기본값)
        }
    };
    const polhdCusTpCd = getPolhdCusTpCd();
    const isBusiness = contractorType === "02" || contractorType === "03";

    // 소재지 주소 결정
    const getLctnAdr = () => {
        if (facilityData?.selectedFloorUnits?.length > 0) {
            const firstUnit = facilityData.selectedFloorUnits[0]?.units?.[0];
            if (firstUnit?.fullNewPlatPlc) {
                return firstUnit.fullNewPlatPlc;
            }
        }
        return buildingData.lctnAdr || "";
    };

    // 주민번호 조합
    const rsidNo = (personalData.residentFront || "") + (personalData.residentBack || "");
    // 이메일 조합
    const emailAdr = personalData.emailLocal && personalData.emailDomain
        ? `${personalData.emailLocal}@${personalData.emailDomain}`
        : "";
    // 휴대폰번호 조합
    const cellNo = (personalData.phonePrefix || "") + (personalData.phoneNumber || "");

    return {
        "pdCd": "17604",  // 상품코드: 17604(주택)
        "insBgnDt": contractData.startDate,  // 보험개시일
        "insEdDt": contractData.endDate,  // 보험종료일
        "polhdCusTpCd": polhdCusTpCd,  // 계약자고객유형: 1:개인, 2:개인사업자, 3:법인사업자
        "polhdNm": personalData.name,  // 계약자명
        // 사업자일 때만 사업자번호 추가
        ...(isBusiness && businessData?.businessNumber && {
            "polhdBizpeNo": businessData.businessNumber
        }),
        "polhdRsidNo": rsidNo,  // 계약자 주민번호 (평문)
        "polhdEmailAdrVal": emailAdr,  // 계약자 이메일 (평문)
        "polhdCellNo": cellNo,  // 계약자 휴대폰번호 (평문)
        "inspeCusTpCd": polhdCusTpCd,  // 피보험자고객유형 (계약자와 동일)
        "inspeNm": personalData.name,  // 피보험자명 (계약자와 동일)
        // 사업자일 때만 피보험자 사업자번호 추가
        ...(isBusiness && businessData?.businessNumber && {
            "inspeBizpeNo": businessData.businessNumber
        }),
        "inspeRsidNo": rsidNo,  // 피보험자 주민번호 (평문)
        "sggNm": buildingData.sggNm,  // 시군구명
        "siNm": buildingData.siNm,  // 시명
        "lctnAdr": getLctnAdr(),  // 소재지주소
        "ekpfDsgYn": buildingData.earthquakeResistantDesign || "2",  // 내진설계여부: 1:예, 2:아니요
        "bldgDtlsCd": "01",  // 건물세부코드: 01:신축
        "bldgGrd": buildingData.bldgGrd || "",  // 건물급수
        "owsDivCon": "소유자",  // 소유구분 (주택은 소유자만 가입 가능)
        "undgSiteYn": (() => {
            const hasBasement = facilityData.selectedFloorUnits?.some(
                item => item.floor?.flrGbCdNm === "지하"
            );
            return hasBasement ? "1" : "2";
        })(),  // 지하소재여부: 1:예, 2:아니오
        "insdSqme": String(facilityData.area || 0),  // 가입면적
        "opjbCd": buildingData.opjbCd || "",  // 건물영위코드
        "sbcHshdNum": facilityData.unitCount || 1,  // 총세대수
        "allFlrSbcYn": "2",  // 전체층가입여부: 2:아니오
        "bldgGndTtFlrNum": buildingData.grndFlrCnt,  // 건물지상총층수
        "bldgUndgTtFlrNum": buildingData.ugrndFlrCnt,  // 건물지하총층수
        "insdGndFlrNumVal": (() => {
            const selectedFloor = facilityData.selectedFloorUnits?.[0]?.floor;
            if (selectedFloor?.flrGbCdNm === "지상" && selectedFloor?.flrNoNm) {
                return String(selectedFloor.flrNoNm);
            }
            return String(buildingData.grndFlrCnt || 1);
        })(),  // 보험가입지상층수값
        "bldgSbcAmt": coverageAmounts.bldgSbcAmt,  // 건물가입금액
        "owbrAmt": 0,  // 자기부담금 (주택풍수해는 0)
        "sgbdTtySbcAmt": 0  // 시설/집기 가입금액 (주택은 0)
    };
};

// 가계약 API 호출을 위한 커스텀 훅
export const useProvisionalContract = () => {
    const [isLoading, setIsLoading] = useState(false);
    const [contractResult, setContractResult] = useState(null);

    // 가계약 API 호출 함수
    const fetchProvisionalContract = async (contextData, setErrorModal) => {
        try {
            setIsLoading(true);

            // V1/V2/V3 모드에 따라 요청 body 및 URL 결정
            const requestBody = USE_V1_API
                ? buildRequestBodyV1(contextData)
                : buildRequestBodyFromContext(contextData);

            const apiUrl = USE_V1_API
                ? `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v1/disaster/premium/provisional`
                : `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/premium/provisional`;

            console.log(`=== 주택풍수해 가계약 API 요청 (${USE_V1_API ? 'V1 평문' : 'V3 암호화'}) ===`);
            console.log("API URL:", apiUrl);
            console.log("Request Body:", requestBody);

            // V3 API: sessionStorage에서 sessionToken 가져오기
            const sessionContext = JSON.parse(sessionStorage.getItem('session_context') || '{}');
            const sessionToken = sessionContext.sessionToken || '';

            // CSRF 토큰 가져오기 (자동 갱신)
            const csrfToken = await csrfManager.getToken();

            const response = await fetch(
                apiUrl,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-CSRF-Token': csrfToken,
                        'X-Session-Token': sessionToken  // V3 API requirement
                    },
                    body: JSON.stringify(requestBody)
                }
            );

            // 403 에러 (CSRF 토큰 오류) 시 자동 재시도
            if (response.status === 403) {
                console.log('CSRF 토큰 오류 (403), 재발급 후 재시도...');
                csrfManager.clearToken();
                const newToken = await csrfManager.getToken();

                const retryResponse = await fetch(
                    apiUrl,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-CSRF-Token': newToken,
                            'X-Session-Token': sessionToken  // V3 API requirement
                        },
                        body: JSON.stringify(requestBody)
                    }
                );

                const retryResponseData = await retryResponse.json();
                const retryData = retryResponseData.data;

                if (!checkApiError(retryData, setErrorModal)) return null;

                setContractResult(retryData);
                return retryData;
            }

            const responseData = await response.json();
            const data = responseData.data;

            console.log("=== 주택풍수해 가계약 API 응답 ===");
            console.log(responseData);

            if (!checkApiError(data, setErrorModal)) return null;

            setContractResult(data);
            return data;

        } catch (error) {
            console.error("가계약 API 호출 오류:", error);
            setErrorModal({
                isOpen: true,
                message: error.message || "가계약 처리 중 오류가 발생했습니다.",
                subMsg: "고객센터에 문의해주세요.",
                errCd: ""  // catch 블록에서는 errCd가 없으므로 빈 문자열
            });
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        isLoading,
        contractResult,
        fetchProvisionalContract
    };
};
