import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDisasterInsurance } from '../../../../context/DisasterInsuranceContext'
import styles from '../../../../css/disasterSafeguard/confirm.module.css'
import chk from '../../../../assets/DownChk.svg'
import editIcon from '../../../../assets/edit-icon.svg'
import BaseModalBottom from '../../../../components/layout/BaseModalBottom'
import InsuranceDatePicker from '../../components/InsuranceDatePicker'
import SafetyButton from '../../../../components/buttons/SafetyButton'
import Loading from '../../../../components/loadings/Loading'
import { useProvisionalContract } from './ProvisionalContract'
import DisasterHeader from '../../../../components/headers/DisasterHeader'
import ErrorModal from '../../../../components/modals/ErrorModal'

function Confirm() {
    const navigate = useNavigate();
    const { personalData, facilityData, buildingData, coverageAmounts, premiumData, businessData, contractData: insuranceContractData, updateContractData, getBusinessAddress, isMerchant } = useDisasterInsurance();
    const [showPremiumDetail, setShowPremiumDetail] = useState(false);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [errorCode, setErrorCode] = useState(null);  // errCd 저장
    const [showCalendarModal, setShowCalendarModal] = useState(false);

    // 가계약 관련 상태
    const { isLoading: isContractLoading, contractData, error: contractError, fetchProvisionalContract } = useProvisionalContract();

    const handleConfirm = async () => {
        try {
            // 1. 가계약 API 호출 (모든 Context 데이터 전달)
            const result = await fetchProvisionalContract({
                facilityData,
                businessData,
                buildingData,
                coverageAmounts,
                personalData,
                contractData: insuranceContractData,
                businessAddress: getBusinessAddress()
            });

            // 2. 가계약 데이터를 Context에 저장 (보험료 포함)
            if (result.prctrNo) {
                updateContractData({
                    prctrNo: result.prctrNo,
                    rltLinkUrl1: result.rltLinkUrl1 || '',
                    rltLinkUrl2: result.rltLinkUrl2 || '',
                    aplPrem: result.aplPrem || '',           // 총 보험료
                    indvBrdPrem: result.indvBrdPrem || '',   // 본인 부담 (실제 결제 금액)
                    govBrdPrem: result.govBrdPrem || '',     // 정부 부담
                    locgovBrdPrem: result.locgovBrdPrem || '' // 지자체 부담
                });
            }

            // 3. 문서 확인 페이지로 이동
            navigate('/document');
        } catch (error) {
            // 4. 에러 모달 표시
            console.error('가계약 실패:', error);
            setErrorCode(error.errCd || null);  // errCd 저장
            setShowErrorModal(true);
        }
    };

    // 에러 모달 닫기
    const handleCloseErrorModal = () => {
        setShowErrorModal(false);
        // 세션 만료 관련 에러일 때만 /price로 이동
        const sessionErrorCodes = ['20202', '20204', '20205', '20208', '70002'];
        if (sessionErrorCodes.includes(errorCode)) {
            navigate('/price');
        }
        setErrorCode(null);  // 에러 코드 초기화
    };

    // 날짜 선택 핸들러
    const handleDateSelect = ({ startDate, endDate }) => {
        updateContractData({
            startDate,
            endDate
        });
        setShowCalendarModal(false);
    };

    // Result 페이지와 동일한 보험료 포매팅
    const indvBrdPrem = premiumData?.indvBrdPrem ? Number(premiumData.indvBrdPrem).toLocaleString('ko-KR') : '0';
    const aplPrem = premiumData?.aplPrem ? Number(premiumData.aplPrem).toLocaleString('ko-KR') : '0';
    const locgovBrdPrem = premiumData?.locgovBrdPrem ? Number(premiumData.locgovBrdPrem).toLocaleString('ko-KR') : '0';
    const govBrdPrem = premiumData?.govBrdPrem ? Number(premiumData.govBrdPrem).toLocaleString('ko-KR') : '0';

    // 보험기간 (Context에서 가져온 날짜 사용)
    const formatContextDate = (dateStr) => {
        if (!dateStr || dateStr.length !== 8) return '';
        const year = dateStr.substring(0, 4);
        const month = dateStr.substring(4, 6);
        const day = dateStr.substring(6, 8);
        return `${year}.${month}.${day}`;
    };

    const insurancePeriod = insuranceContractData.startDate && insuranceContractData.endDate
        ? `${formatContextDate(insuranceContractData.startDate)} ~ ${formatContextDate(insuranceContractData.endDate)}`
        : '-';

    // 피보험자정보 데이터 매핑
    const insuredName = personalData.name || '-';  // userInfo 페이지에서 입력한 이름
    const businessNumber = businessData.inspeBizpeNo ?
        `${businessData.inspeBizpeNo.slice(0, 3)}-${businessData.inspeBizpeNo.slice(3, 5)}-${businessData.inspeBizpeNo.slice(5)}` : '-';
    const businessType = businessData.businessType || '-';
    const companyName = businessData.companyName || '-';  // workPlaceInfo 페이지에서 입력한 상호명

    // 사업장 소재지 (Context에서 계산된 값 사용)
    const businessAddress = getBusinessAddress();

    // 보장내역 데이터 (소유자/임차인에 따라 다름)
    const isOwner = facilityData.owsDivCon === "소유자";

    // 원 단위를 만원 단위로 변환하여 표시 (20000000 → "2,000만원")
    const formatAmount = (amountInWon) => {
        if (!amountInWon || amountInWon === 0) return '-';
        const amountInManWon = amountInWon / 10000;
        return Number(amountInManWon).toLocaleString('ko-KR') + '만원';
    };

    // 사용 층 정보 포맷팅 (ResultDisplay와 동일한 로직)
    const formatFloorInfo = () => {
        // total 또는 all-buildings 선택 시 "전체" 표시
        if (facilityData.selectedBuildingType === "total" || facilityData.selectedBuildingType === "all-buildings") {
            return "전체";
        }

        // floor 선택 시
        if (!facilityData.selectedFloorUnits || facilityData.selectedFloorUnits.length === 0) {
            return '-';
        }

        // ResultDisplay와 동일한 로직 사용
        const floorDisplay = facilityData.selectedFloorUnits
            .map((item) => {
                return item.floor.flrGbCdNm === "지하"
                    ? `지하 ${item.floor.flrNo}층`
                    : item.floor.flrNo;
            })
            .join(", ") + " 층";

        return floorDisplay;
    };

    return (
        <>
            <DisasterHeader title="실손보상 소상공인 풍수해·지진재해보험" />
            {isContractLoading && <Loading />}
            <div className={styles.confirmContainer}>
                <section className={styles.confirmSection}>

                    <h2>보험가입 전 확인해주세요</h2>
                    <div className={styles.cardContents}>
                        <div className={`${styles.cardbox} ${styles.insuranceInfo}`}>
                            <h3>실손보상 소상공인 풍수해·지진재해보험</h3>
                            <ul>
                                <li><p>결제 보험료</p>
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
                                        <span>{insurancePeriod}</span>
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
                                    <p>
                                        플랜
                                    </p>
                                    <span>
                                        표준형
                                    </span></li>
                            </ul>
                        </div>
                        <div className={styles.cardbox}>
                            <div className={styles.buttonWrap}>
                                <button className={styles.insuredEditBtn} onClick={() => navigate('/userInfo')}>수정하기</button>
                            </div>
                            <h3>대표자정보</h3>
                            <ul>
                                <li>
                                    <p>대표자</p>
                                    <span>{insuredName}</span>
                                </li>
                                <li>
                                    <p>사업자번호</p>
                                    <span>{businessNumber}</span>
                                </li>
                                <li>
                                    <p>상호명</p>
                                    <span>{companyName}</span>
                                </li>
                                <li>
                                    <p>업태/종목</p>
                                    <span>{businessType}</span>
                                </li>
                                <li className={styles.businessAddress}>
                                    <p>사업장소재지</p>
                                    <span>{businessAddress}</span>
                                </li>
                            </ul>
                            <div className={styles.boundaryWrap}>
                                <div className={styles.boundary}></div>
                            </div>
                            <div className={styles.buttonWrap}>
                                <button className={styles.coverageBtnEdit} onClick={() => navigate('/price')}>수정하기</button>
                            </div>
                            <h3>보장내역</h3>
                            <ul>
                                {isOwner ? (
                                    // 소유자일 때
                                    <>
                                        <li>
                                            <p>건물</p>
                                            <span>{formatAmount(coverageAmounts.bldgSbcAmt)}</span>
                                        </li>
                                        <li>
                                            <p>시설 및 집기</p>
                                            <span>{formatAmount(coverageAmounts.fclSbcAmt)}</span>
                                        </li>
                                        <li>
                                            <p>재고자산</p>
                                            <span>{formatAmount(coverageAmounts.invnAsetSbcAmt)}</span>
                                        </li>
                                        {/* 설치기계 - 소공인만 표시 (소상인 불가) */}
                                        {!isMerchant() && (
                                            <li>
                                                <p>설치기계</p>
                                                <span>{formatAmount(coverageAmounts.instlMachSbcAmt)}</span>
                                            </li>
                                        )}
                                    </>
                                ) : (
                                    // 임차인일 때
                                    <>
                                        <li>
                                            <p>시설 및 집기</p>
                                            <span>{formatAmount(coverageAmounts.fclSbcAmt)}</span>
                                        </li>
                                        <li>
                                            <p>재고자산</p>
                                            <span>{formatAmount(coverageAmounts.invnAsetSbcAmt)}</span>
                                        </li>
                                        {/* 설치기계 - 소공인만 표시 (소상인 불가) */}
                                        {!isMerchant() && (
                                            <li>
                                                <p>설치기계</p>
                                                <span>{formatAmount(coverageAmounts.instlMachSbcAmt)}</span>
                                            </li>
                                        )}
                                    </>
                                )}
                            </ul>
                        </div>

                        <div className={styles.cardbox}>
                            <h3>목적물 정보</h3>
                            <ul>
                                <li>
                                    <p>소재지</p>
                                    <span>{buildingData.lctnAdr || '-'}</span>
                                </li>
                                <li>
                                    <p>건물명</p>
                                    <span>{buildingData.bdNm || '-'}</span>
                                </li>
                                <li>
                                    <p>건물 용도</p>
                                    <span>{buildingData.titleInfo?.mainPurpsCdNm || '-'}</span>
                                </li>
                                <li>
                                    <p>구조 (기둥)</p>
                                    <span>{buildingData.titleInfo?.strctCdNm || '-'}</span>
                                </li>
                                <li>
                                    <p>지붕</p>
                                    <span>{buildingData.titleInfo?.roofCdNm || '-'}</span>
                                </li>
                                <li>
                                    <p>층수</p>
                                    <span>지상 {buildingData.grndFlrCnt || 0}층 / 지하 {buildingData.ugrndFlrCnt || 0}층</span>
                                </li>
                                <li>
                                    <p>사용 층</p>
                                    <span>{formatFloorInfo()}</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                </section>
            </div>
            <SafetyButton
                buttonText={isContractLoading ? "가계약 진행 중..." : "내용을 확인했습니다"}
                onClick={handleConfirm}
                disabled={isContractLoading}
            />

            {/* 에러 모달 */}
            {showErrorModal && contractError && (
                <ErrorModal
                    message={contractError}
                    onClose={handleCloseErrorModal}
                />
            )}

            {/* 캘린더 모달 */}
            {showCalendarModal && (
                <BaseModalBottom onClose={() => setShowCalendarModal(false)}>
                    <InsuranceDatePicker
                        onDateSelect={handleDateSelect}
                        onClose={() => setShowCalendarModal(false)}
                        initialDate={insuranceContractData.startDate}
                    />
                </BaseModalBottom>
            )}
        </>
    )
}

export default Confirm
