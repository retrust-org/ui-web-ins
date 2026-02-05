import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDisasterInsurance } from '../../../../context/DisasterInsuranceContext';
import { useSession } from '../../../../context/SessionContext';
import { usePaymentContract } from './PaymentContract';
import SafetyButton from '../../../../components/buttons/SafetyButton';
import Loading from '../../../../components/loadings/Loading';
import styles from '../../../../css/disasterSafeguard/pay.module.css';
import DisasterHeader from '../../../../components/headers/DisasterHeader';
import ErrorModal from '../../../../components/modals/ErrorModal';
import { useSessionState } from '../../hooks/useSessionState';
import { useCrypto } from '../../../../hooks/useCrypto';

function Pay() {
    const navigate = useNavigate();
    const { premiumData, authData, contractData, personalData } = useDisasterInsurance();
    const { sessionToken } = useSession();
    const { isLoading: isContractLoading, submitPaymentContract } = usePaymentContract();

    // 암호화 초기화
    const { crypto, isReady } = useCrypto();
    const [isEncrypting, setIsEncrypting] = useState(false);

    // 필수 데이터 검증 - 없으면 처음으로 리다이렉트
    useEffect(() => {
        const hasRequiredData =
            sessionToken &&  // V3 API: sessionToken 사용
            authData?.birthdate &&
            contractData?.prctrNo &&
            contractData?.indvBrdPrem;  // 가계약 API의 보험료 사용

        if (!hasRequiredData) {
            alert('필수 데이터가 없습니다. 처음부터 다시 진행해주세요.');
            navigate('/');
        }
    }, [sessionToken, authData, contractData, navigate]);

    // 결제 수단 상태
    const [paymentMethod, setPaymentMethod] = useState('card'); // 'card' or 'bank'

    // 예금주명은 개인정보에서 자동 복원 (보안상 카드번호는 복원하지 않음)
    const [cardHolderName, setCardHolderName] = useSessionState(personalData.name, '');

    // 카드 정보는 보안상 sessionStorage 복원 안 함
    const [cardNum1, setCardNum1] = useState('');
    const [cardNum2, setCardNum2] = useState('');
    const [cardNum3, setCardNum3] = useState('');
    const [cardNum4, setCardNum4] = useState('');
    const [expiryMonth, setExpiryMonth] = useState('');
    const [expiryYear, setExpiryYear] = useState('');

    // UI 상태
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

    // contentEditable div refs
    const cardNum1Ref = useRef(null);
    const cardNum2Ref = useRef(null);
    const cardNum3Ref = useRef(null);
    const cardNum4Ref = useRef(null);
    const expiryMonthRef = useRef(null);
    const expiryYearRef = useRef(null);

    // Helper 함수: contentEditable div의 커서 위치 가져오기
    const getCursorPosition = (element) => {
        const selection = window.getSelection();
        if (!selection.rangeCount) return 0;

        const range = selection.getRangeAt(0);
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);

        return preCaretRange.toString().length;
    };

    // Helper 함수: contentEditable div의 커서 위치 설정
    const setCursorPosition = (element, position) => {
        const range = document.createRange();
        const selection = window.getSelection();

        // 텍스트 노드가 없으면 생성
        if (!element.firstChild) {
            element.appendChild(document.createTextNode(''));
        }

        const textNode = element.firstChild;
        const length = textNode.textContent.length;

        // 유효한 범위로 위치 제한
        const safePosition = Math.min(Math.max(0, position), length);

        try {
            range.setStart(textNode, safePosition);
            range.setEnd(textNode, safePosition);
            range.collapse(true);

            selection.removeAllRanges();
            selection.addRange(range);
        } catch (e) {
            console.warn('Could not set cursor position:', e);
        }
    };

    // 카드번호 입력 처리 (contentEditable div용 - 커서 위치 보존)
    const handleCardNum1Change = (e) => {
        const element = e.currentTarget;
        const cursorPos = getCursorPosition(element);
        const rawValue = element.textContent;

        // 값 처리
        let value = rawValue.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);

        // 상태 업데이트
        setCardNum1(value);

        // DOM 업데이트 (값이 변경된 경우만)
        if (rawValue !== value) {
            element.textContent = value;
            const removedChars = rawValue.length - value.length;
            const newCursorPos = Math.max(0, cursorPos - removedChars);
            setCursorPosition(element, newCursorPos);
        }

        // 4자리 입력 시 다음 칸으로 포커스 이동
        if (value.length === 4 && cardNum2Ref.current) {
            cardNum2Ref.current.focus();
        }
    };

    const handleCardNum2Change = (e) => {
        const element = e.currentTarget;
        const cursorPos = getCursorPosition(element);
        const rawValue = element.textContent;

        let value = rawValue.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);

        setCardNum2(value);

        if (rawValue !== value) {
            element.textContent = value;
            const removedChars = rawValue.length - value.length;
            const newCursorPos = Math.max(0, cursorPos - removedChars);
            setCursorPosition(element, newCursorPos);
        }

        if (value.length === 4 && cardNum3Ref.current) {
            cardNum3Ref.current.focus();
        }
    };

    const handleCardNum3Change = (e) => {
        const element = e.currentTarget;
        const cursorPos = getCursorPosition(element);
        const rawValue = element.textContent;

        let value = rawValue.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);

        setCardNum3(value);

        if (rawValue !== value) {
            element.textContent = value;
            const removedChars = rawValue.length - value.length;
            const newCursorPos = Math.max(0, cursorPos - removedChars);
            setCursorPosition(element, newCursorPos);
        }

        if (value.length === 4 && cardNum4Ref.current) {
            cardNum4Ref.current.focus();
        }
    };

    const handleCardNum4Change = (e) => {
        const element = e.currentTarget;
        const cursorPos = getCursorPosition(element);
        const rawValue = element.textContent;

        let value = rawValue.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);

        setCardNum4(value);

        if (rawValue !== value) {
            element.textContent = value;
            const removedChars = rawValue.length - value.length;
            const newCursorPos = Math.max(0, cursorPos - removedChars);
            setCursorPosition(element, newCursorPos);
        }
    };

    // 유효기간 입력 처리 (contentEditable div용 - 커서 위치 보존)
    const handleExpiryMonthChange = (e) => {
        const element = e.currentTarget;
        const cursorPos = getCursorPosition(element);
        const rawValue = element.textContent;

        let value = rawValue.replace(/\D/g, '');
        if (value.length > 2) value = value.slice(0, 2);
        if (parseInt(value) > 12) value = '12';

        setExpiryMonth(value);

        if (rawValue !== value) {
            element.textContent = value;
            const removedChars = rawValue.length - value.length;
            const newCursorPos = Math.max(0, cursorPos - removedChars);
            setCursorPosition(element, newCursorPos);
        }

        // 2자리 입력 시 다음 칸으로 포커스 이동
        if (value.length === 2 && expiryYearRef.current) {
            expiryYearRef.current.focus();
        }
    };

    const handleExpiryYearChange = (e) => {
        const element = e.currentTarget;
        const cursorPos = getCursorPosition(element);
        const rawValue = element.textContent;

        let value = rawValue.replace(/\D/g, '');
        if (value.length > 2) value = value.slice(0, 2);

        setExpiryYear(value);

        if (rawValue !== value) {
            element.textContent = value;
            const removedChars = rawValue.length - value.length;
            const newCursorPos = Math.max(0, cursorPos - removedChars);
            setCursorPosition(element, newCursorPos);
        }
    };

    // 결제 처리
    const handlePayment = async () => {
        if (paymentMethod === 'bank') {
            setError('실시간 계좌이체는 준비 중입니다.');
            return;
        }

        if (!isReady) {
            alert('잠시만 기다려주세요.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            setIsEncrypting(true);

            // 카드번호 합치기
            const fullCardNumber = `${cardNum1}${cardNum2}${cardNum3}${cardNum4}`;

            // 유효기간 YYYYMM 형식으로 변환
            const currentYear = new Date().getFullYear();
            const century = Math.floor(currentYear / 100) * 100;
            const efctPrd = `${century + parseInt(expiryYear)}${expiryMonth}`;

            // 생년월일 YYYYMMDD → YYMMDD 변환
            const birthdateYYMMDD = authData.birthdate?.slice(2) || '';

            // 검증
            if (!cardHolderName || cardHolderName.trim() === '') {
                console.error('❌ 예금주명이 비어있습니다!');
            }
            if (!birthdateYYMMDD || birthdateYYMMDD.length !== 6) {
                console.error('❌ 생년월일 형식 오류:', birthdateYYMMDD);
            }
            if (cardHolderName !== authData.name) {
                console.warn('⚠️ 예금주명과 본인인증 이름이 다릅니다!');
                console.warn('   입력:', cardHolderName);
                console.warn('   본인인증:', authData.name);
            }

            // 결제 정보 암호화
            const encryptedPayment = await crypto.encryptHybrid({
                crdNo: fullCardNumber,
                dporCd: birthdateYYMMDD
            });

            // 결제 API 호출 (V3 API - sessionToken 사용)
            const result = await submitPaymentContract({
                prctrNo: contractData.prctrNo,            // 가계약번호
                efctPrd: efctPrd,                         // 유효기간 YYYYMM
                dporNm: cardHolderName,                   // 예금주명
                rcptPrem: contractData?.indvBrdPrem || 0, // 영수보험료 (가계약 API의 최종 확정 금액)
                paymentMethod: paymentMethod,             // 결제수단 ('card' or 'bank')
                encryptedPayment: encryptedPayment        // 암호화된 결제 정보 (encryptedKey, encryptedData)
                // sessionToken은 X-Session-Token 헤더로 전송
            });

            // 결제 성공 - 결제완료 페이지로 이동 (NFT 민팅용 tid 전달)
            navigate(`/pay/complete/${result?.tid || 'unknown'}`, {
                state: {
                    rltLinkUrl4: result?.rltLinkUrl4
                }
            });

        } catch (error) {
            console.error('결제 처리 오류:', error);
            setErrorModal({
                isOpen: true,
                message: error.message || '결제 처리 중 오류가 발생했습니다.'
            });
        } finally {
            setIsEncrypting(false);
            setIsLoading(false);
        }
    };

    return (
        <>
            <DisasterHeader title="실손보상 소상공인 풍수해·지진재해보험" />
            {(isLoading || isEncrypting) && <Loading />}
            <div className={styles.payContainer}>
                <section className={styles.paySection}>
                    <h2>결제수단을 선택해주세요</h2>

                    {/* 결제수단 선택 탭 */}
                    <div className={styles.paymentMethodTabs}>
                        <ul>
                            <li
                                className={paymentMethod === 'card' ? styles.active : ''}
                                onClick={() => setPaymentMethod('card')}
                            >
                                카드결제
                            </li>
                            <li
                                className={paymentMethod === 'bank' ? styles.active : ''}
                                onClick={() => setPaymentMethod('bank')}
                            >
                                실시간 계좌이체
                            </li>
                        </ul>
                    </div>

                    {/* 카드 결제 폼 */}
                    {paymentMethod === 'card' && (
                        <div className={styles.paymentCard}>
                            <h3>본인명의의 카드정보를 입력해주세요</h3>

                            {/* 예금주명 (카드소유자명) */}
                            <div className={styles.inputSection}>
                                <div className={styles.cardHolderWrapper}>
                                    <div className={styles.inputLabel}>예금주명</div>
                                    <input
                                        type="text"
                                        value={cardHolderName}
                                        onChange={(e) => setCardHolderName(e.target.value)}
                                        placeholder="카드소유자 이름"
                                        className={styles.cardHolderInput}
                                    />
                                </div>
                            </div>

                            {/* 카드번호 */}
                            <div className={styles.inputSection}>
                                <div className={styles.cardNumberWrapper}>
                                    <div className={styles.inputLabel}>카드번호</div>
                                    <div className={styles.cardInputsContainer}>
                                        <div
                                            ref={cardNum1Ref}
                                            contentEditable
                                            suppressContentEditableWarning
                                            onInput={handleCardNum1Change}
                                            className={styles.cardInput}
                                            data-placeholder="0000"
                                        ></div>
                                        <div
                                            ref={cardNum2Ref}
                                            contentEditable
                                            suppressContentEditableWarning
                                            onInput={handleCardNum2Change}
                                            className={styles.cardInput}
                                            data-placeholder="0000"
                                        ></div>
                                        <div
                                            ref={cardNum3Ref}
                                            contentEditable
                                            suppressContentEditableWarning
                                            onInput={handleCardNum3Change}
                                            className={styles.cardInput}
                                            data-placeholder="0000"
                                        ></div>
                                        <div
                                            ref={cardNum4Ref}
                                            contentEditable
                                            suppressContentEditableWarning
                                            onInput={handleCardNum4Change}
                                            className={styles.cardInput}
                                            data-placeholder="0000"
                                        ></div>
                                    </div>
                                </div>
                            </div>

                            {/* 유효기간 */}
                            <div className={styles.inputSection}>
                                <div className={styles.expiryWrapper}>
                                    <div className={styles.inputLabel}>유효기간</div>
                                    <div className={styles.expiryInputsContainer}>
                                        <div
                                            ref={expiryMonthRef}
                                            contentEditable
                                            suppressContentEditableWarning
                                            onInput={handleExpiryMonthChange}
                                            className={styles.expiryInput}
                                            data-placeholder="MM"
                                        ></div>
                                        <span className={styles.divider}>/</span>
                                        <div
                                            ref={expiryYearRef}
                                            contentEditable
                                            suppressContentEditableWarning
                                            onInput={handleExpiryYearChange}
                                            className={styles.expiryInput}
                                            data-placeholder="YY"
                                        ></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* 계좌이체 안내 */}
                    {paymentMethod === 'bank' && (
                        <div className={styles.bankTransferNotice}>
                            <p>
                                실시간 계좌이체 서비스는<br />
                                준비 중입니다.<br />
                                <br />
                                카드결제를 이용해주세요.
                            </p>
                        </div>
                    )}

                    {/* 에러 메시지 */}
                    {error && (
                        <div className={styles.errorMessage}>
                            {error}
                        </div>
                    )}
                </section>
            </div>

            <SafetyButton
                buttonText={isLoading || isEncrypting ? "결제 처리 중..." : "결제하기"}
                onClick={handlePayment}
                disabled={isLoading || isEncrypting}
            />

            {errorModal.isOpen && (
                <ErrorModal
                    message={errorModal.message}
                    onClose={() => setErrorModal({ isOpen: false, message: "" })}
                />
            )}
        </>
    );
}

export default Pay;
