import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import DisasterHeader from '../../../../components/headers/DisasterHeader'
import SafetyButton from '../../../../components/buttons/SafetyButton'
import Loading from '../../../../components/loadings/Loading'
import Result from './Result'
import ContractorTypeModal from './ContractorTypeModal'
import ErrorModal from '../../../../components/modals/ErrorModal'
import styles from '../../../../css/disasterHouse/price.module.css'
import { useDisasterHouse } from '../../../../context/DisasterHouseContext'
import { useSession } from '../../../../context/SessionContext'
import { getSessionToken } from '../../services/consentService'
import csrfManager from '../../../../utils/csrfTokenManager'
import { checkApiError } from '../../../../utils/checkApiError'

function Price() {
    const navigate = useNavigate();
    const { buildingData, facilityData, coverageAmounts, contractData, updateCoverageAmounts, updateContractorType, setPremiumData: setContextPremiumData } = useDisasterHouse();
    // V3 API: sessionToken 통합
    const { setSessionToken } = useSession();

    // buildingCost 가져오기 (두 가지 케이스)
    const getBuildingCost = () => {
        // Case 1: 동/호수 선택 시 저장된 buildingCost
        if (facilityData?.buildingCost) {
            return facilityData.buildingCost;
        }
        // Case 2: 단독주택 - unifiedApiData에서 가져오기
        const titles = buildingData?.unifiedApiData?.data?.registryInfo?.titles || [];
        return titles[0]?.buildingCost || null;
    };

    const buildingCost = getBuildingCost();

    // 금액 포맷팅 함수 (원 → 억/만원)
    const formatAmount = (amount) => {
        if (!amount) return "0원";
        const eok = Math.floor(amount / 100000000);
        const man = Math.floor((amount % 100000000) / 10000);
        if (eok > 0 && man > 0) return `${eok}억 ${man.toLocaleString()}만원`;
        if (eok > 0) return `${eok}억원`;
        return `${man.toLocaleString()}만원`;
    };

    // buildingCost 값들
    const maxCoverageAmount = buildingCost?.maxCoverageAmount || 0; // 최대한도금액 (= 재조달가액)
    const insuranceValue = Math.floor(maxCoverageAmount * 0.8);    // 보험가액 (재조달가액의 80%)
    const minCoverageAmount = buildingCost?.minCoverageAmount || 0; // 최소한도금액

    // Context에서 저장된 값이 있으면 불러오기, 없으면 minCoverageAmount를 기본값으로 (원 → 만원 변환, 소수점 제거)
    const getInitialPrice = () => {
        if (coverageAmounts?.bldgSbcAmt) {
            const priceInManwon = Math.floor(coverageAmounts.bldgSbcAmt / 10000);
            return priceInManwon.toLocaleString();
        }
        // 기본값: minCoverageAmount (원 → 만원, 소수점 제거)
        if (minCoverageAmount > 0) {
            const priceInManwon = Math.floor(minCoverageAmount / 10000);
            return priceInManwon.toLocaleString();
        }
        return '';
    };

    const [priceValue, setPriceValue] = useState(getInitialPrice);
    const [showResultModal, setShowResultModal] = useState(false);
    const [showContractorModal, setShowContractorModal] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [premiumData, setPremiumData] = useState(null);
    const [apiErrorModal, setApiErrorModal] = useState({ isOpen: false, message: "", subMsg: "" });

    // buildingCost가 없으면 ErrorModal 표시
    useEffect(() => {
        if (!buildingCost) {
            setShowErrorModal(true);
        }
    }, [buildingCost]);

    // 주소(pnu) 또는 buildingCost가 변경되면 priceValue를 새 minCoverageAmount로 초기화
    useEffect(() => {
        // coverageAmounts.bldgSbcAmt가 0이면 새 주소가 등록된 것으로 판단
        // 또는 buildingCost가 변경되었을 때 새 minCoverageAmount로 초기화
        if (buildingCost?.minCoverageAmount) {
            // bldgSbcAmt가 0이거나, 현재 입력값이 새 buildingCost 범위를 벗어난 경우 초기화
            const currentValue = Number(priceValue.replace(/,/g, '')) * 10000;
            const isOutOfRange = currentValue < buildingCost.minCoverageAmount || currentValue > buildingCost.maxCoverageAmount;
            const isReset = coverageAmounts?.bldgSbcAmt === 0;

            if (isReset || isOutOfRange) {
                const newMinPrice = Math.floor(buildingCost.minCoverageAmount / 10000);
                setPriceValue(newMinPrice.toLocaleString());
            }
        }
    }, [buildingCost?.minCoverageAmount, buildingCost?.maxCoverageAmount, buildingData.pnu, coverageAmounts?.bldgSbcAmt]);

    // 숫자만 입력받고 천단위 콤마 포맷팅 (최대값 검증 포함, 최솟값 제한 없음)
    const handlePriceChange = (e) => {
        const value = e.target.value.replace(/[^0-9]/g, ''); // 숫자만 추출
        if (value === '') {
            setPriceValue('');
            return;
        }
        let numValue = Number(value);

        // 최대값 검증 (만원 단위로 비교, 소수점 제거)
        const maxInManwon = Math.floor(maxCoverageAmount / 10000);
        if (numValue > maxInManwon) {
            numValue = maxInManwon;
        }

        const formattedValue = numValue.toLocaleString(); // 천단위 콤마 추가
        setPriceValue(formattedValue);
    };

    // 현재 입력값을 억/만원 형식으로 변환
    const getFormattedPriceValue = () => {
        if (!priceValue || priceValue.trim() === '') return "0원";
        const numValue = Number(priceValue.replace(/,/g, ''));
        const amountInWon = numValue * 10000; // 만원 → 원
        const eok = Math.floor(amountInWon / 100000000);
        const man = Math.floor((amountInWon % 100000000) / 10000);
        if (eok > 0 && man > 0) return `${eok}억 ${man.toLocaleString()}만원`;
        if (eok > 0) return `${eok}억원`;
        return `${man.toLocaleString()}만원`;
    };

    // 현재 입력값의 퍼센트 계산 (최대한도금액 대비, 소수점 1자리)
    const getCoveragePercent = () => {
        if (!priceValue || priceValue.trim() === '' || !maxCoverageAmount) return '0.0';
        const numValue = Number(priceValue.replace(/,/g, ''));
        const amountInWon = numValue * 10000; // 만원 → 원
        return ((amountInWon / maxCoverageAmount) * 100).toFixed(1);
    };

    // ErrorModal 닫기 및 이전 페이지로 이동
    const handleErrorModalClose = () => {
        setShowErrorModal(false);
        navigate(-1); // 이전 페이지로 이동
    };

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

    // 보험가입지상층수값 계산
    const getInsdGndFlrNumVal = () => {
        const selectedFloor = facilityData.selectedFloorUnits?.[0]?.floor;
        if (selectedFloor?.flrGbCdNm === "지상" && selectedFloor?.flrNoNm) {
            return String(selectedFloor.flrNoNm);
        }
        return String(buildingData.grndFlrCnt || 1);
    };

    // 지하소재여부 판단
    const getUndgSiteYn = () => {
        const hasBasement = facilityData.selectedFloorUnits?.some(
            item => item.floor?.flrGbCdNm === "지하"
        );
        return hasBasement ? "1" : "2";
    };

    // sessionToken 발급 함수
    // V3 API: sessionToken 통합 - 보험료 조회할 때마다 새로운 sessionToken 발급
    const fetchSessionToken = async () => {
        try {
            // disaster-house: 재해보험 주택용 (20개 동의 필요)
            const result = await getSessionToken('disaster-house');
            setSessionToken(result.sessionToken, result.expiresAt);

            console.log('sessionToken 발급 완료 (disaster-house):', result.sessionToken);
            return result.sessionToken;
        } catch (error) {
            console.error("sessionToken 발급 실패:", error);
            throw error;
        }
    };

    // 간편 보험료 조회 API 호출
    const handleFetchPremium = async () => {
        try {
            setIsLoading(true);

            // 만원 → 원 변환
            const numericValue = Number(priceValue.replace(/,/g, ''));
            const bldgSbcAmt = numericValue * 10000;

            const requestBody = {
                // 기본 필드
                insBgnDt: contractData.startDate || "",
                insEdDt: contractData.endDate || "",
                siNm: buildingData.siNm || "",
                sggNm: buildingData.sggNm || "",
                lctnAdr: getLctnAdr(),
                ekpfDsgYn: buildingData.earthquakeResistantDesign || "2",
                bldgDtlsCd: "01",
                bldgGrd: buildingData.bldgGrd || "",
                insdSqme: String(facilityData.area || ""),
                bldgSbcAmt: bldgSbcAmt,
                allFlrSbcYn: "2",
                insdGndFlrNumVal: getInsdGndFlrNumVal(),
                // 추가 필드 (7개)
                opjbCd: buildingData.opjbCd || "",
                sbcHshdNum: facilityData.unitCount || 1,
                undgSiteYn: getUndgSiteYn(),
                bldgGndTtFlrNum: Number(buildingData.grndFlrCnt) || 0,
                bldgUndgTtFlrNum: Number(buildingData.ugrndFlrCnt) || 0,
                owbrAmt: 0,
                sgbdTtySbcAmt: 0
            };

            console.log("=== 주택풍수해 간편 보험료 조회 API 요청 ===");
            console.log("Request Body:", requestBody);

            // CSRF 토큰 가져오기
            const csrfToken = await csrfManager.getToken();

            const response = await fetch(
                `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/housing/premium`,
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
                    `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/housing/premium`,
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

                if (!checkApiError(retryData, setApiErrorModal)) return null;

                console.log("=== 주택풍수해 간편 보험료 조회 API 응답 ===");
                console.log(retryData);

                setPremiumData(retryData);
                setContextPremiumData(retryData);  // Context에도 저장
                return retryData;
            }

            const responseData = await response.json();

            console.log("=== 주택풍수해 간편 보험료 조회 API 응답 ===");
            console.log("Full Response:", responseData);

            const data = responseData.data;
            console.log("Data:", data);

            if (!checkApiError(data, setApiErrorModal)) return null;

            setPremiumData(data);
            setContextPremiumData(data);  // Context에도 저장
            return data;

        } catch (error) {
            console.error("보험료 조회 API 호출 오류:", error);
            setApiErrorModal({
                isOpen: true,
                message: error.message || "보험료 조회 중 오류가 발생했습니다.",
                subMsg: "고객센터에 문의해주세요."
            });
            return null;
        } finally {
            setIsLoading(false);
        }
    };

    // 확인하기 버튼 클릭 핸들러
    const handleConfirmClick = async () => {
        try {
            setIsLoading(true);

            // 1. sessionToken 발급 (30분 유효) - 실패해도 보험료 계산은 진행
            try {
                await fetchSessionToken();
            } catch (tokenError) {
                console.warn("sessionToken 발급 실패 (보험료 계산은 계속 진행):", tokenError);
            }

            // 2. Premium API 호출 (sessionToken 불필요)
            const result = await handleFetchPremium();

            // API 성공 후 모달 표시
            if (result) {
                setShowResultModal(true);
            }
        } catch (error) {
            console.error("보험료 조회 실패:", error);
            // 에러는 handleFetchPremium에서 이미 처리됨
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <DisasterHeader title="실손보상 주택 풍수해·지진재해보험" backPath="/insuranceDate" />
            {isLoading && <Loading />}
            <section className={styles.priceSection}>
                <div className={styles.priceSectionWrap}>
                    <h2>가입금액을 선택해주세요</h2>
                    <ul>
                        <li>
                            <p>건물 재조달가액</p>
                            <span>{formatAmount(maxCoverageAmount)}</span>
                        </li>
                        <li>
                            <p>건물 보험가액</p>
                            <span>{formatAmount(insuranceValue)}</span>
                        </li>
                    </ul>
                    <div className={styles.priceContents}>
                        <div className={styles.priceContentsWraps}>
                            <div className={styles.priceContentsTitle}>
                                <h3 className={styles.priceMainTitle}>건물보험가입금액</h3>
                                <p className={styles.priceSubTitle}>대부분 보험가액과 동일한 금액을 선택해요</p>
                            </div>
                            <div className={styles.pricePayContents}>
                                <div className={styles.pricePayWrap}>
                                    <input
                                        type="text"
                                        value={priceValue}
                                        onChange={handlePriceChange}
                                        className={styles.priceInput}
                                    />
                                    <p>만원</p>
                                </div>
                                <div className={styles.maxPay}>
                                    <p>{getFormattedPriceValue()}</p>
                                    <p>({getCoveragePercent()}%)</p>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </section>

            <SafetyButton
                buttonText={isLoading ? "조회 중..." : "확인하기"}
                onClick={handleConfirmClick}
                disabled={!priceValue || priceValue.trim() === '' || isLoading}
            />

            {/* 결과 모달 */}
            {showResultModal && (
                <Result
                    isOpen={showResultModal}
                    onClose={() => setShowResultModal(false)}
                    onConfirm={() => {
                        setShowResultModal(false);
                        setShowContractorModal(true);
                    }}
                    premiumData={premiumData}
                />
            )}

            {/* 계약자 유형 선택 모달 */}
            {showContractorModal && (
                <ContractorTypeModal
                    isOpen={showContractorModal}
                    onClose={() => setShowContractorModal(false)}
                    onSelect={(selectedContractorType) => {
                        // 가입금액을 Context에 저장 (만원 → 원 변환)
                        const numericValue = Number(priceValue.replace(/,/g, ''));
                        const amountInWon = numericValue * 10000; // 만원 → 원
                        updateCoverageAmounts({
                            bldgSbcAmt: amountInWon
                        });
                        console.log("=== 건물 가입금액 저장 ===");
                        console.log("입력값:", priceValue, "만원");
                        console.log("저장값:", amountInWon, "원");

                        // Context에 계약자 타입 저장 (sessionStorage 자동 동기화)
                        updateContractorType(selectedContractorType);

                        setShowContractorModal(false);
                        navigate('/limitAnnounce');
                    }}
                />
            )}

            {/* 건물 가격 정보 없음 에러 모달 */}
            {showErrorModal && (
                <ErrorModal
                    message="건물 가격 정보를 확인할 수 없습니다"
                    subMsg="해당 건물의 보험가액 정보가 없어 가입이 어렵습니다. 다른 주소로 다시 시도해 주세요."
                    onClose={handleErrorModalClose}
                />
            )}

            {/* API 에러 모달 */}
            {apiErrorModal.isOpen && (
                <ErrorModal
                    message={apiErrorModal.message}
                    subMsg={apiErrorModal.subMsg}
                    onClose={() => setApiErrorModal({ isOpen: false, message: "", subMsg: "" })}
                />
            )}
        </>
    )
}

export default Price
