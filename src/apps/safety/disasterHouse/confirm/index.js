import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../../../../css/disasterHouse/confirm.module.css'
import DisasterHeader from '../../../../components/headers/DisasterHeader'
import SafetyButton from '../../../../components/buttons/SafetyButton'
import Loading from '../../../../components/loadings/Loading'
import ErrorModal from '../../../../components/modals/ErrorModal'
import BaseModalBottom from '../../../../components/layout/BaseModalBottom'
import InsuranceDatePicker from '../../components/InsuranceDatePicker'
import editIcon from '../../../../assets/edit-icon.svg'
import chk from '../../../../assets/DownChk.svg'
import { useDisasterHouse } from '../../../../context/DisasterHouseContext'
import { useProvisionalContract } from './ProvisionalContract'

function Confirm() {
    const navigate = useNavigate();
    const {
        contractorType,
        businessData,
        personalData,
        buildingData,
        facilityData,
        coverageAmounts,
        premiumData,
        contractData,
        updateContractData
    } = useDisasterHouse();

    const { isLoading, fetchProvisionalContract } = useProvisionalContract();
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: "", subMsg: "", errCd: "" });
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [showPremiumDetail, setShowPremiumDetail] = useState(false);

    // Context에서 보험료 데이터 포맷팅
    const indvBrdPrem = premiumData?.indvBrdPrem ? Number(premiumData.indvBrdPrem).toLocaleString('ko-KR') : '0';
    const aplPrem = premiumData?.aplPrem ? Number(premiumData.aplPrem).toLocaleString('ko-KR') : '0';
    const locgovBrdPrem = premiumData?.locgovBrdPrem ? Number(premiumData.locgovBrdPrem).toLocaleString('ko-KR') : '0';
    const govBrdPrem = premiumData?.govBrdPrem ? Number(premiumData.govBrdPrem).toLocaleString('ko-KR') : '0';

    // 날짜 선택 핸들러
    const handleDateSelect = ({ startDate, endDate }) => {
        updateContractData({
            startDate,
            endDate
        });
        setShowCalendarModal(false);
    };

    // 금액 포맷팅 (원 단위 → 만원 단위 또는 원 단위 표시)
    const formatCurrency = (amount) => {
        if (!amount && amount !== 0) return "-";
        const num = typeof amount === 'string' ? parseInt(amount, 10) : amount;
        return num.toLocaleString() + "원";
    };

    // 날짜 포맷팅 (YYYYMMDD → YYYY.MM.DD)
    const formatDate = (dateStr) => {
        if (!dateStr || dateStr.length !== 8) return "-";
        return `${dateStr.substring(0, 4)}.${dateStr.substring(4, 6)}.${dateStr.substring(6, 8)}`;
    };

    // 보험기간 표시
    const getInsurancePeriod = () => {
        const startDate = contractData.startDate;
        const endDate = contractData.endDate;
        if (!startDate || !endDate) return "-";
        return `${formatDate(startDate)} ~ ${formatDate(endDate)}`;
    };

    // 계약자 구분 표시
    const getContractorTypeText = () => {
        return contractorType === "01" ? "개인" : "사업자";
    };

    // 이메일 표시
    const getEmail = () => {
        if (!personalData.emailLocal || !personalData.emailDomain) return "-";
        return `${personalData.emailLocal}@${personalData.emailDomain}`;
    };

    // 휴대폰번호 표시
    const getPhoneNumber = () => {
        if (!personalData.phonePrefix || !personalData.phoneNumber) return "-";
        // 전화번호 포맷팅 (예: 010-1234-5678)
        const phone = personalData.phoneNumber;
        if (phone.length === 8) {
            return `${personalData.phonePrefix}-${phone.substring(0, 4)}-${phone.substring(4)}`;
        }
        return `${personalData.phonePrefix}-${phone}`;
    };

    // 사업자번호 표시
    const getBusinessNumber = () => {
        if (contractorType !== "02") return "-";
        if (!businessData.businessNumber) return "-";
        // 사업자번호 포맷팅 (예: 123-45-67890)
        const num = businessData.businessNumber;
        if (num.length === 10) {
            return `${num.substring(0, 3)}-${num.substring(3, 5)}-${num.substring(5)}`;
        }
        return num;
    };

    // 소재지 주소
    const getAddress = () => {
        // 호실 정보가 있으면 fullNewPlatPlc 사용
        if (facilityData?.selectedFloorUnits?.length > 0) {
            const firstUnit = facilityData.selectedFloorUnits[0]?.units?.[0];
            if (firstUnit?.fullNewPlatPlc) {
                return firstUnit.fullNewPlatPlc;
            }
        }
        return buildingData.lctnAdr || "-";
    };

    // 주택종류 표시
    const getHouseType = () => {
        // 1. 선택된 호실의 면적 정보에서 mainPurpsCdNm 가져오기
        if (facilityData?.selectedFloorUnits?.length > 0) {
            const firstUnit = facilityData.selectedFloorUnits[0]?.units?.[0];
            const areaDetail = firstUnit?.areaDetails?.[0];
            if (areaDetail?.mainPurpsCdNm) {
                return areaDetail.mainPurpsCdNm;
            }
        }

        // 2. Fallback: unifiedApiData에서 층별 purposeInfos 확인
        const titles = buildingData.unifiedApiData?.data?.registryInfo?.titles || [];
        if (titles.length > 0) {
            const floors = titles[0]?.floors || [];
            if (floors.length > 0) {
                const purposeInfo = floors[0]?.purposeInfos?.[0];
                if (purposeInfo?.mainPurps?.mainPurpsCdNm) {
                    return purposeInfo.mainPurps.mainPurpsCdNm;
                }
            }
            // titles에서 etcPurps 확인
            if (titles[0]?.etcPurps) {
                return titles[0].etcPurps;
            }
        }

        return buildingData.houseType || "-";
    };

    // 구조 표시
    const getStructure = () => {
        const titles = buildingData.unifiedApiData?.data?.registryInfo?.titles || [];
        if (titles.length > 0) {
            return titles[0].strctCdNm || "-";
        }
        return buildingData.structure || "-";
    };

    // 전용면적 표시
    const getExclusiveArea = () => {
        if (!facilityData.area) return "-";
        return `${Number(facilityData.area).toFixed(2)}m²`;
    };

    // "내용을 확인했습니다" 버튼 클릭 시 가계약 API 호출
    const handleNext = async () => {
        // 데이터 확인용 콘솔 로그
        console.log("=== 주택풍수해 개인정보 데이터 확인 ===");
        console.log("personalData:", personalData);
        console.log("encryptedFields:", personalData.encryptedFields);
        console.log("buildingData:", buildingData);
        console.log("facilityData:", facilityData);
        console.log("coverageAmounts:", coverageAmounts);
        console.log("contractData:", contractData);

        // 기본 개인정보 체크 (V1/V2 공통)
        if (!personalData?.name) {
            setErrorModal({
                isOpen: true,
                message: "개인정보가 누락되었습니다. 이전 단계로 돌아가 주세요."
            });
            return;
        }

        const result = await fetchProvisionalContract({
            contractorType,
            businessData,
            personalData,
            buildingData,
            facilityData,
            coverageAmounts,
            contractData
        }, setErrorModal);

        if (!result) return;

        // API 응답을 Context에 저장
        updateContractData({
            prctrNo: result.prctrNo || "",
            rltLinkUrl1: result.rltLinkUrl1 || "",
            rltLinkUrl2: result.rltLinkUrl2 || "",
            aplPrem: result.aplPrem || "",
            indvBrdPrem: result.indvBrdPrem || "",
            govBrdPrem: result.govBrdPrem || "",
            locgovBrdPrem: result.locgovBrdPrem || ""
        });

        // 성공 시 다음 페이지로 이동
        navigate('/document');
    };

    return (
        <>
            <DisasterHeader title="실손보상 주택 풍수해·지진재해보험" backPath="/userInfo" />
            {isLoading && <Loading />}

            <div className={styles.confirmContainer}>
                <section className={styles.confirmSection}>
                    <h2>보험가입 전 확인해주세요</h2>
                    <div className={styles.cardContents}>
                        {/* 섹션 1: 보험 정보 */}
                        <div className={`${styles.cardbox} ${styles.insuranceInfo}`}>
                            <h3>실손보상 주택 풍수해·지진재해보험</h3>
                            <ul>
                                <li>
                                    <p>결제 보험료</p>
                                    <div className={styles.pricedata}>
                                        <span>{indvBrdPrem}원</span>
                                        <img
                                            src={chk}
                                            alt="chk-icon"
                                            width={20}
                                            height={20}
                                            onClick={() => setShowPremiumDetail(!showPremiumDetail)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </div>
                                </li>
                                {showPremiumDetail && (
                                    <>
                                        <li className={styles.premiumDetail}>
                                            <p>총보험료</p>
                                            <span>{aplPrem}원</span>
                                        </li>
                                        <li className={styles.premiumDetail}>
                                            <p>지방자치단체부담보험료</p>
                                            <span>{locgovBrdPrem}원</span>
                                        </li>
                                        <li className={`${styles.premiumDetail} ${styles.lastItem}`}>
                                            <p>정부부담보험료</p>
                                            <span>{govBrdPrem}원</span>
                                        </li>
                                    </>
                                )}
                                <li>
                                    <p>보험기간</p>
                                    <div className={styles.pricedata}>
                                        <span>{getInsurancePeriod()}</span>
                                        <img
                                            src={editIcon}
                                            alt="edit-icon"
                                            width={24}
                                            height={24}
                                            onClick={() => setShowCalendarModal(true)}
                                            style={{ cursor: 'pointer' }}
                                        />
                                    </div>
                                </li>
                                <li>
                                    <p>건물 가입금액</p>
                                    <span>{formatCurrency(coverageAmounts.bldgSbcAmt)}</span>
                                </li>
                                {coverageAmounts.hhgdFntrSbcAmt > 0 && (
                                    <li>
                                        <p>가재도구 가입금액</p>
                                        <span>{formatCurrency(coverageAmounts.hhgdFntrSbcAmt)}</span>
                                    </li>
                                )}
                            </ul>
                            <div className={styles.buttonWrap}>
                                <button onClick={() => navigate('/price')}>수정하기</button>
                            </div>
                        </div>

                        {/* 섹션 2: 계약자/피보험자 정보 */}
                        <div className={styles.cardbox}>
                            <h3>계약자/피보험자 정보</h3>
                            <ul>
                                <li>
                                    <p>구분</p>
                                    <span>{getContractorTypeText()}</span>
                                </li>
                                <li>
                                    <p>이름</p>
                                    <span>{personalData.name || "-"}</span>
                                </li>
                                <li>
                                    <p>이메일</p>
                                    <span>{getEmail()}</span>
                                </li>
                                <li>
                                    <p>휴대폰번호</p>
                                    <span>{getPhoneNumber()}</span>
                                </li>
                                {contractorType === "02" && (
                                    <li>
                                        <p>사업자번호</p>
                                        <span>{getBusinessNumber()}</span>
                                    </li>
                                )}
                            </ul>
                        </div>

                        {/* 섹션 3: 목적물정보 */}
                        <div className={styles.cardbox}>
                            <h3>목적물정보</h3>
                            <ul>
                                <li className={styles.longText}>
                                    <p>소재지</p>
                                    <span>{getAddress()}</span>
                                </li>
                                <li>
                                    <p>주택종류</p>
                                    <span>{getHouseType()}</span>
                                </li>
                                <li>
                                    <p>구조</p>
                                    <span>{getStructure()}</span>
                                </li>
                                <li>
                                    <p>가입 전용면적</p>
                                    <span>{getExclusiveArea()}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </section>
            </div>

            <SafetyButton
                buttonText={isLoading ? '처리 중...' : '내용을 확인했습니다'}
                onClick={handleNext}
                disabled={isLoading}
            />

            {errorModal.isOpen && (
                <ErrorModal
                    message={errorModal.message}
                    subMsg={errorModal.subMsg}
                    onClose={() => {
                        setErrorModal({ isOpen: false, message: "", subMsg: "", errCd: "" });
                        // 세션 만료 관련 에러일 때만 /price로 이동
                        const sessionErrorCodes = ['20202', '20204', '20205', '20208', '70002'];
                        if (sessionErrorCodes.includes(errorModal.errCd)) {
                            navigate('/price');
                        }
                    }}
                />
            )}

            {/* 캘린더 모달 */}
            {showCalendarModal && (
                <BaseModalBottom onClose={() => setShowCalendarModal(false)}>
                    <InsuranceDatePicker
                        onDateSelect={handleDateSelect}
                        onClose={() => setShowCalendarModal(false)}
                        initialDate={contractData.startDate}
                    />
                </BaseModalBottom>
            )}
        </>
    )
}

export default Confirm
