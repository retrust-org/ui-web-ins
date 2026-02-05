import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../../../../css/disasterHouse/userinfo.module.css'
import DisasterHeader from '../../../../components/headers/DisasterHeader'
import SafetyButton from '../../../../components/buttons/SafetyButton'
import { useDisasterHouse } from '../../../../context/DisasterHouseContext'
import Loading from '../../../../components/loadings/Loading'
import ErrorModal from '../../../../components/modals/ErrorModal'
import { verifyBusinessNumber, checkVerificationResult, getBusinessErrorMessage } from '../../services/businessVerificationService'

function BusinessInfo() {
    const navigate = useNavigate();
    const { updateContractorType, updateBusinessData } = useDisasterHouse();

    // 계약자 구분 (02: 개인사업자, 03: 법인사업자)
    const [contractorType, setContractorType] = useState('');

    // 사업자등록번호
    const [businessNumber, setBusinessNumber] = useState('');

    // 상호명 (사업자검증에 필요)
    const [businessName, setBusinessName] = useState('');

    // 사업자 검증 상태
    const [isVerifying, setIsVerifying] = useState(false);
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

    // 사업자등록번호 포맷팅 (XXX-XX-XXXXX)
    const formatBusinessNumber = (value) => {
        const numbers = value.replace(/[^0-9]/g, '');
        if (numbers.length <= 3) {
            return numbers;
        } else if (numbers.length <= 5) {
            return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
        } else {
            return `${numbers.slice(0, 3)}-${numbers.slice(3, 5)}-${numbers.slice(5, 10)}`;
        }
    };

    const handleBusinessNumberChange = (e) => {
        const formatted = formatBusinessNumber(e.target.value);
        setBusinessNumber(formatted);
    };

    // 폼 유효성 검증
    const isFormValid = () => {
        const isContractorTypeValid = contractorType !== '';
        const isBusinessNameValid = businessName.trim() !== '';
        // 사업자등록번호는 하이픈 포함 12자리 (XXX-XX-XXXXX)
        const isBusinessNumberValid = businessNumber.replace(/-/g, '').length === 10;
        return isContractorTypeValid && isBusinessNameValid && isBusinessNumberValid;
    };

    // 다음으로 버튼 클릭 핸들러
    const handleNext = async () => {
        if (!isFormValid()) return;

        // 사업자번호에서 하이픈 제거
        const cleanBusinessNumber = businessNumber.replace(/-/g, '');

        try {
            setIsVerifying(true);

            // 사업자번호 검증 API 호출
            const response = await verifyBusinessNumber(cleanBusinessNumber, businessName.trim());

            // 검증 결과 확인
            const result = checkVerificationResult(response);

            if (!result.isValid) {
                // 검증 실패 - 에러 모달 표시
                const errorMessage = getBusinessErrorMessage(
                    result.errorCode,
                    result.errorMessage
                );

                setErrorModal({
                    isOpen: true,
                    message: errorMessage
                });

                return;
            }

            // 검증 성공 - Context에 저장 (02: 개인사업자, 03: 법인사업자)
            updateContractorType(contractorType);
            updateBusinessData({
                businessNumber: cleanBusinessNumber,
                businessName: businessName.trim()
            });

            // userInfo 페이지로 이동
            navigate('/userInfo');

        } catch (error) {
            console.error('사업자 검증 오류:', error);
            setErrorModal({
                isOpen: true,
                message: error.message || '사업자번호 검증 중 오류가 발생했습니다.'
            });
        } finally {
            setIsVerifying(false);
        }
    };

    return (
        <>
            {errorModal.isOpen && (
                <ErrorModal
                    message={errorModal.message}
                    onClose={() => setErrorModal({ isOpen: false, message: '' })}
                />
            )}
            {isVerifying && <Loading />}
            <DisasterHeader title="실손보상 주택 풍수해·지진재해보험" backPath="/signupChkConsent" />
            <div className={styles.container}>
                <section className={styles.businessSection}>
                    <h1>사업자 정보를<br />입력해주세요</h1>

                    <div className={styles.inputWrap}>
                        <label>계약자 구분</label>
                        <select
                            className={styles.businessSelect}
                            value={contractorType}
                            onChange={(e) => setContractorType(e.target.value)}
                        >
                            <option value="">선택해주세요</option>
                            <option value="02">개인사업자</option>
                            <option value="03">법인사업자</option>
                        </select>
                    </div>

                    <div className={styles.inputWrap}>
                        <label>상호명</label>
                        <input
                            type="text"
                            placeholder="상호명을 입력해주세요"
                            value={businessName}
                            onChange={(e) => setBusinessName(e.target.value)}
                            className={styles.inputName}
                        />
                    </div>

                    <div className={styles.inputWrap}>
                        <label>사업자등록번호</label>
                        <input
                            type="text"
                            placeholder="000-00-00000"
                            value={businessNumber}
                            onChange={handleBusinessNumberChange}
                            maxLength={12}
                            className={styles.inputName}
                        />
                    </div>
                </section>

                <SafetyButton
                    buttonText='다음으로'
                    disabled={!isFormValid()}
                    onClick={handleNext}
                />
            </div>
        </>
    )
}

export default BusinessInfo
