import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../../../../css/disasterSafeguard/userinfo.module.css'
import FinConsumerCheck from './FinConsumerCheck'
import SafetyButton from '../../../../components/buttons/SafetyButton'
import { useDisasterInsurance } from '../../../../context/DisasterInsuranceContext'
import DisasterHeader from '../../../../components/headers/DisasterHeader'
import { useSessionState } from '../../hooks/useSessionState'
import CommonSecureKeyboard from '../../../../components/secureKeyboards/CommonSecureKeyboard'
import { useCrypto } from '../../../../hooks/useCrypto'
import Loading from '../../../../components/loadings/Loading'

function UserInfo() {
    const { personalData, updatePersonalData, authData } = useDisasterInsurance();
    const navigate = useNavigate();

    // 암호화 초기화
    const { crypto, isReady } = useCrypto();
    const [isEncrypting, setIsEncrypting] = useState(false);

    // sessionStorage에서 복원된 값으로 자동 초기화
    const [consumerType, setConsumerType] = useSessionState(personalData.consumerType, '');
    const [isModalOpen, setIsModalOpen] = useState(!personalData.consumerType); // consumerType 있으면 모달 닫기

    // 이메일 도메인 타입 복원
    const [emailDomainType, setEmailDomainType] = useState(() => {
        if (personalData.emailDomain) {
            const commonDomains = ['gmail.com', 'naver.com', 'daum.net', 'kakao.com', 'yahoo.com', 'nate.com'];
            return commonDomains.includes(personalData.emailDomain) ? personalData.emailDomain : 'direct';
        }
        return '';
    });

    const [formData, setFormData] = useState({
        name: personalData.name || '',
        residentFront: personalData.residentFront || '',
        residentBack: personalData.residentBack || '',
        phonePrefix: personalData.phonePrefix || '',
        phoneNumber: personalData.phoneNumber || '',
        emailLocal: personalData.emailLocal || '',
        emailDomain: personalData.emailDomain || ''
    });

    // 직접입력 모드에서 입력한 전체 이메일을 별도로 저장
    const [directEmail, setDirectEmail] = useState(() => {
        // personalData에서 복원할 때, emailDomain이 일반 도메인이 아니면 전체 이메일 복원
        if (personalData.emailLocal && personalData.emailDomain) {
            const commonDomains = ['gmail.com', 'naver.com', 'daum.net', 'kakao.com', 'yahoo.com', 'nate.com'];
            if (!commonDomains.includes(personalData.emailDomain)) {
                return `${personalData.emailLocal}@${personalData.emailDomain}`;
            }
        }
        return '';
    });

    // 본인인증 데이터로 폼 자동 입력
    useEffect(() => {
        if (authData && authData.name) {

            // 휴대폰번호 파싱 (예: "010-4568-9311" → prefix: "010", number: "45689311")
            let phonePrefix = '';
            let phoneNumber = '';
            if (authData.mobileno) {
                const phoneParts = authData.mobileno.split('-');
                if (phoneParts.length >= 2) {
                    phonePrefix = phoneParts[0];
                    phoneNumber = phoneParts.slice(1).join('');
                }
            }

            // 생년월일에서 주민번호 앞자리 추출 (예: "19951227" → "951227")
            let residentFront = '';
            if (authData.birthdate && authData.birthdate.length === 8) {
                residentFront = authData.birthdate.substring(2);  // 뒤 6자리
            }

            setFormData(prev => ({
                ...prev,
                name: authData.name || '',
                residentFront: residentFront,
                phonePrefix: phonePrefix,
                phoneNumber: phoneNumber
            }));
        }
    }, [authData]);

    const handleDomainChange = (e) => {
        const selectedValue = e.target.value;
        setEmailDomainType(selectedValue);

        if (selectedValue === 'direct') {
            // 직접입력 선택 시: emailLocal 값이 있으면 directEmail에 반영
            if (formData.emailLocal) {
                setDirectEmail(formData.emailLocal);
            }
        } else {
            // 일반 도메인 선택 시: emailDomain 업데이트
            setFormData(prev => ({
                ...prev,
                emailDomain: selectedValue
            }));
        }
    };

    const handleConsumerTypeSelect = (type) => {
        setConsumerType(type);
        setIsModalOpen(false);
    };

    // 폼 유효성 검증
    const isFormValid = () => {
        const isNameValid = formData.name.trim() !== '';
        const isResidentValid = formData.residentFront.length === 6 && formData.residentBack.length === 7;
        const isPhoneValid = formData.phonePrefix !== '' && formData.phoneNumber.length >= 7;
        const isEmailValid = emailDomainType === 'direct' ?
            directEmail.includes('@') && directEmail.includes('.') :
            (formData.emailLocal !== '' && formData.emailDomain !== '');
        const isConsumerValid = consumerType !== '';

        return isNameValid && isResidentValid && isPhoneValid && isEmailValid && isConsumerValid;
    };

    // 다음으로 버튼 클릭 핸들러
    const handleNext = async () => {
        if (!isFormValid()) return;

        if (!isReady) {
            alert('잠시만 기다려주세요.');
            return;
        }

        try {
            setIsEncrypting(true);

            let finalData = { ...formData };

            // 직접입력 시 이메일 처리
            if (emailDomainType === 'direct') {
                const atIndex = directEmail.indexOf('@');
                if (atIndex > 0) {
                    finalData.emailLocal = directEmail.substring(0, atIndex);
                    finalData.emailDomain = directEmail.substring(atIndex + 1);
                }
            }

            // 암호화 (Hybrid 방식으로 변경)
            const encryptedFields = await crypto.encryptHybrid({
                polhdRsidNo: finalData.residentFront + finalData.residentBack,
                inspeRsidNo: finalData.residentFront + finalData.residentBack,
                polhdEmailAdrVal: finalData.emailLocal + '@' + finalData.emailDomain,
                polhdCellNo: finalData.phonePrefix + finalData.phoneNumber
            });

            // 암호화 결과 확인
            console.log('=== 가계약 암호화 결과 (Hybrid) ===');
            console.log('암호화된 AES 키:', encryptedFields.encryptedKey);
            console.log('암호화된 데이터:', encryptedFields.encryptedData);
            console.log('데이터 구조:', Object.keys(encryptedFields));
            console.log('===================================');

            updatePersonalData({
                ...finalData,
                consumerType: consumerType,
                encryptedFields: encryptedFields
            });

            navigate('/confirm');
        } catch (error) {
            console.error('처리 실패:', error);
            alert('오류가 발생했습니다.');
        } finally {
            setIsEncrypting(false);
        }
    };

    return (
        <>
            <DisasterHeader title="실손보상 소상공인 풍수해·지진재해보험" />
            <div className={styles.container}>
                <section className={styles.userinfoSection}>
                <h1>대표자의<br />
                    정보를 입력해주세요</h1>
                <div className={styles.form}>
                    <div className={styles.inputWrap}>
                        <label htmlFor="">계약자</label>
                        <input
                            type="text"
                            placeholder='이름'
                            className={styles.inputName}
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                        />
                    </div>
                    <div className={styles.inputWrap}>
                        <label htmlFor="">주민번호</label>
                        <div className={styles.ResidentNum}>
                            <input
                                type="text"
                                maxLength="6"
                                placeholder="생년월일"
                                value={formData.residentFront}
                                onChange={(e) => {
                                    if(/^\d*$/.test(e.target.value)) {
                                        setFormData(prev => ({...prev, residentFront: e.target.value}));
                                    }
                                }}
                            />
                            <div className={styles.line}></div>
                            <div className={styles.customSecureInput}>
                                <CommonSecureKeyboard
                                    value={formData.residentBack}
                                    onChange={(value) => setFormData(prev => ({...prev, residentBack: value}))}
                                    onConfirm={(value) => setFormData(prev => ({...prev, residentBack: value}))}
                                    maxLength={7}
                                    maskValue="secret"
                                    placeholder="뒷자리"
                                />
                            </div>
                        </div>
                    </div>
                    <div className={styles.inputWrap}>
                        <label htmlFor="">휴대폰 번호</label>
                        <div className={styles.phoneNum}>
                            <select
                                value={formData.phonePrefix}
                                onChange={(e) => setFormData(prev => ({...prev, phonePrefix: e.target.value}))}
                            >
                                <option value="">선택</option>
                                <option value="010">010</option>
                                <option value="011">011</option>
                                <option value="016">016</option>
                                <option value="017">017</option>
                                <option value="018">018</option>
                                <option value="019">019</option>
                            </select>
                            <input
                                type="text"
                                placeholder='-빼고 입력해주세요'
                                maxLength="8"
                                value={formData.phoneNumber}
                                onChange={(e) => {
                                    if(/^\d*$/.test(e.target.value)) {
                                        setFormData(prev => ({...prev, phoneNumber: e.target.value}));
                                    }
                                }}
                            />
                        </div>
                    </div>
                    <div className={styles.inputWrap}>
                        <label htmlFor="">이메일</label>
                        <div className={styles.emailAddress}>
                            {emailDomainType === 'direct' ? (
                                <input
                                    type="text"
                                    placeholder="example@xxxx.com"
                                    className={styles.fullEmail}
                                    value={directEmail}
                                    onChange={(e) => setDirectEmail(e.target.value)}
                                />
                            ) : (
                                <>
                                    <input
                                        type="text"
                                        placeholder="이메일 입력"
                                        value={formData.emailLocal}
                                        onChange={(e) => setFormData(prev => ({...prev, emailLocal: e.target.value}))}
                                    />
                                    <p>@</p>
                                </>
                            )}
                            <select className={styles.emailDomain} value={emailDomainType} onChange={handleDomainChange}>
                                <option value="">선택</option>
                                <option value="gmail.com">gmail.com</option>
                                <option value="naver.com">naver.com</option>
                                <option value="daum.net">daum.net</option>
                                <option value="kakao.com">kakao.com</option>
                                <option value="yahoo.com">yahoo.com</option>
                                <option value="nate.com">nate.com</option>
                                <option value="direct">직접입력</option>
                            </select>
                        </div>
                    </div>
                </div>
            </section>
            {isEncrypting && <Loading />}
            <SafetyButton
                buttonText='다음으로'
                disabled={!isFormValid() || isEncrypting}
                onClick={handleNext}
            />
            {/* 금융소비자 확인 모달 */}
            <FinConsumerCheck
                isOpen={isModalOpen}
                onConsumerTypeSelect={handleConsumerTypeSelect}
            />
            </div>
        </>
    )
}

export default UserInfo
