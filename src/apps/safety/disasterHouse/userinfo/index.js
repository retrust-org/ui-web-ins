import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import styles from '../../../../css/disasterHouse/userinfo.module.css'
import FinConsumerCheck from './FinConsumerCheck'
import SafetyButton from '../../../../components/buttons/SafetyButton'
import DisasterHeader from '../../../../components/headers/DisasterHeader'
import CommonSecureKeyboard from '../../../../components/secureKeyboards/CommonSecureKeyboard'
import { useCrypto } from '../../../../hooks/useCrypto'
import Loading from '../../../../components/loadings/Loading'
import { useDisasterHouse } from '../../../../context/DisasterHouseContext'

// 이메일 도메인 타입 결정 헬퍼 함수
const COMMON_DOMAINS = ['gmail.com', 'naver.com', 'daum.net', 'kakao.com', 'yahoo.com', 'nate.com'];

function UserInfo() {
    const navigate = useNavigate();
    const { authData, personalData, updatePersonalData } = useDisasterHouse();

    // 암호화 초기화
    const { crypto, isReady } = useCrypto();
    const [isEncrypting, setIsEncrypting] = useState(false);

    // 금융소비자 확인 모달 - Context에서 복원
    const [consumerType, setConsumerType] = useState(personalData.consumerType || '');
    const [isModalOpen, setIsModalOpen] = useState(!personalData.consumerType);

    // 이메일 도메인 타입 - Context에서 자동 복원
    const [emailDomainType, setEmailDomainType] = useState(() => {
        if (personalData.emailDomain) {
            return COMMON_DOMAINS.includes(personalData.emailDomain)
                ? personalData.emailDomain
                : 'direct';
        }
        return '';
    });

    // 주민번호 뒷자리 입력 완료 여부 (암호화 데이터 존재 여부로 판단)
    const [isResidentBackFilled, setIsResidentBackFilled] = useState(
        !!personalData.encryptedFields
    );

    // 폼 데이터 - Context에서 이메일 복원
    const [formData, setFormData] = useState({
        name: '',
        residentFront: '',
        residentBack: '',  // 평문 저장 안함, 새 입력 시에만 사용
        phonePrefix: '',
        phoneNumber: '',
        emailLocal: personalData.emailLocal || '',
        emailDomain: personalData.emailDomain || ''
    });

    // 직접입력 모드에서 입력한 전체 이메일 - Context에서 복원
    const [directEmail, setDirectEmail] = useState(() => {
        if (personalData.emailLocal && personalData.emailDomain) {
            if (!COMMON_DOMAINS.includes(personalData.emailDomain)) {
                return `${personalData.emailLocal}@${personalData.emailDomain}`;
            }
        }
        return '';
    });

    // Context authData에서 본인인증 데이터 복원
    useEffect(() => {
        if (authData.name) {
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
                residentFront = authData.birthdate.substring(2);
            }

            setFormData(prev => ({
                ...prev,
                name: authData.name,
                residentFront: residentFront,
                phonePrefix: phonePrefix,
                phoneNumber: phoneNumber
            }));
        }
    }, [authData]);

    // Context personalData 변경 시 로컬 state 동기화
    useEffect(() => {
        if (personalData.consumerType) {
            setConsumerType(personalData.consumerType);
            setIsModalOpen(false);
        }
        if (personalData.encryptedFields) {
            setIsResidentBackFilled(true);
        }
        if (personalData.emailLocal) {
            setFormData(prev => ({
                ...prev,
                emailLocal: personalData.emailLocal,
                emailDomain: personalData.emailDomain
            }));
        }
        if (personalData.emailDomain) {
            const domainType = COMMON_DOMAINS.includes(personalData.emailDomain)
                ? personalData.emailDomain
                : 'direct';
            setEmailDomainType(domainType);
            if (domainType === 'direct' && personalData.emailLocal) {
                setDirectEmail(`${personalData.emailLocal}@${personalData.emailDomain}`);
            }
        }
    }, [personalData]);

    const handleDomainChange = (e) => {
        const selectedValue = e.target.value;
        setEmailDomainType(selectedValue);

        if (selectedValue === 'direct') {
            if (formData.emailLocal) {
                setDirectEmail(formData.emailLocal);
            }
        } else {
            setFormData(prev => ({
                ...prev,
                emailDomain: selectedValue
            }));
        }
    };

    const handleConsumerTypeSelect = (type) => {
        setConsumerType(type);
        setIsModalOpen(false);
        // Context에 즉시 저장 (sessionStorage 자동 동기화)
        updatePersonalData({ consumerType: type });
    };

    // 폼 유효성 검증
    const isFormValid = () => {
        const isNameValid = formData.name.trim() !== '';
        // 주민번호 뒷자리: 새로 입력했거나 기존 암호화 데이터가 있으면 유효
        const isResidentValid = formData.residentFront.length === 6 &&
            (formData.residentBack.length === 7 || isResidentBackFilled);
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

            // 주민번호 뒷자리 평문은 저장하지 않음
            const { residentBack, ...dataWithoutResidentBack } = finalData;

            let encryptedFields;

            let residentBackLast = personalData.residentBackLast || '';

            // 새로 입력된 주민번호 뒷자리가 있으면 재암호화
            if (formData.residentBack && formData.residentBack.length === 7) {
                if (!isReady) {
                    alert('잠시만 기다려주세요.');
                    setIsEncrypting(false);
                    return;
                }

                encryptedFields = await crypto.encryptHybrid({
                    polhdRsidNo: finalData.residentFront + formData.residentBack,
                    inspeRsidNo: finalData.residentFront + formData.residentBack,
                    polhdEmailAdrVal: finalData.emailLocal + '@' + finalData.emailDomain,
                    polhdCellNo: finalData.phonePrefix + finalData.phoneNumber
                });

                // 마지막 자리만 저장 (마스킹 표시용)
                residentBackLast = formData.residentBack.slice(-1);
            } else if (personalData.encryptedFields) {
                // 기존 암호화 데이터 유지
                encryptedFields = personalData.encryptedFields;
            } else {
                // 암호화 데이터가 없고 새 입력도 없으면 에러
                alert('주민번호 뒷자리를 입력해주세요.');
                setIsEncrypting(false);
                return;
            }

            // Context에 저장 (평문 주민번호 뒷자리 제외, 마지막 자리만 저장)
            updatePersonalData({
                ...dataWithoutResidentBack,
                consumerType: consumerType,
                encryptedFields: encryptedFields,
                residentBackLast: residentBackLast
            });

            // 다음 페이지로 이동
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
            <DisasterHeader title="실손보상 주택 풍수해·지진재해보험" backPath="/signupChkConsent" />
            <div className={styles.container}>
                <section className={styles.userinfoSection}>
                    <h1>계약자의<br />
                        정보를 입력해주세요</h1>
                    <div className={styles.form}>
                        <div className={styles.inputWrap}>
                            <label>계약자</label>
                            <input
                                type="text"
                                placeholder='이름'
                                className={styles.inputName}
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({...prev, name: e.target.value}))}
                            />
                        </div>
                        <div className={styles.inputWrap}>
                            <label>주민번호</label>
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
                                        onChange={(value) => {
                                            setFormData(prev => ({...prev, residentBack: value}));
                                            // 새로 입력 시작하면 기존 암호화 상태 리셋
                                            if (value.length > 0 && isResidentBackFilled) {
                                                setIsResidentBackFilled(false);
                                            }
                                        }}
                                        onConfirm={(value) => setFormData(prev => ({...prev, residentBack: value}))}
                                        maxLength={7}
                                        maskValue="secret"
                                        placeholder={isResidentBackFilled && personalData.residentBackLast
                                            ? `******${personalData.residentBackLast}`
                                            : "뒷자리"}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className={styles.inputWrap}>
                            <label>휴대폰 번호</label>
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
                            <label>이메일</label>
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
