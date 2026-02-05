import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDisasterHouse } from '../../../../context/DisasterHouseContext';
import { usePaymentContract } from './PaymentContract';
import SafetyButton from '../../../../components/buttons/SafetyButton';
import Loading from '../../../../components/loadings/Loading';
import styles from '../../../../css/disasterHouse/pay.module.css';
import DisasterHeader from '../../../../components/headers/DisasterHeader';
import ErrorModal from '../../../../components/modals/ErrorModal';
import BankSelectModal from '../../../../components/modals/BankSelectModal';
import { useCrypto } from '../../../../hooks/useCrypto';

// sessionStorage 기반 state 훅
const useLocalSessionState = (initialValue, key) => {
    const [state, setState] = useState(() => {
        try {
            const item = sessionStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.log('sessionStorage 읽기 오류:', error);
            return initialValue;
        }
    });

    useEffect(() => {
        try {
            sessionStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.log('sessionStorage 저장 오류:', error);
        }
    }, [key, state]);

    return [state, setState];
};

function Pay() {
    const navigate = useNavigate();
    const { authData, contractData, personalData } = useDisasterHouse();
    const { submitPaymentContract } = usePaymentContract();

    // 암호화 초기화
    const { crypto, isReady } = useCrypto();
    const [isEncrypting, setIsEncrypting] = useState(false);

    // 결제 수단 상태 (새로고침 시 유지)
    const [paymentMethod, setPaymentMethod] = useLocalSessionState('card', 'disasterHouse_paymentMethod');

    // 카드 결제 정보 (새로고침 시 유지)
    const [cardHolderName, setCardHolderName] = useLocalSessionState(personalData.name || '', 'disasterHouse_cardHolderName');
    const [cardNum1, setCardNum1] = useLocalSessionState('', 'disasterHouse_cardNum1');
    const [cardNum2, setCardNum2] = useLocalSessionState('', 'disasterHouse_cardNum2');
    const [cardNum3, setCardNum3] = useLocalSessionState('', 'disasterHouse_cardNum3');
    const [cardNum4, setCardNum4] = useLocalSessionState('', 'disasterHouse_cardNum4');
    const [expiryMonth, setExpiryMonth] = useLocalSessionState('', 'disasterHouse_expiryMonth');
    const [expiryYear, setExpiryYear] = useLocalSessionState('', 'disasterHouse_expiryYear');

    // 계좌이체 관련 상태 (새로고침 시 유지)
    const [isBankModalOpen, setIsBankModalOpen] = useState(false);
    const [selectedBank, setSelectedBank] = useLocalSessionState({ name: '', code: '' }, 'disasterHouse_selectedBank');
    const [accountNumber, setAccountNumber] = useLocalSessionState('', 'disasterHouse_accountNumber');

    // UI 상태
    const [isLoading, setIsLoading] = useState(false);
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: "", subMsg: "" });

    // 결제하기 버튼 활성화 조건
    const isCardPaymentValid = cardHolderName && cardNum1 && cardNum2 && cardNum3 && cardNum4 && expiryMonth && expiryYear;
    const isBankPaymentValid = cardHolderName && selectedBank.code && accountNumber && accountNumber.length >= 10;

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

        if (!element.firstChild) {
            element.appendChild(document.createTextNode(''));
        }

        const textNode = element.firstChild;
        const length = textNode.textContent.length;
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

    // 카드번호 입력 처리
    const handleCardNum1Change = (e) => {
        const element = e.currentTarget;
        const cursorPos = getCursorPosition(element);
        const rawValue = element.textContent;

        let value = rawValue.replace(/\D/g, '');
        if (value.length > 4) value = value.slice(0, 4);

        setCardNum1(value);

        if (rawValue !== value) {
            element.textContent = value;
            const removedChars = rawValue.length - value.length;
            const newCursorPos = Math.max(0, cursorPos - removedChars);
            setCursorPosition(element, newCursorPos);
        }

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

    // 유효기간 입력 처리
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

    // 결제 수단 변경 핸들러
    const handlePaymentMethodChange = (method) => {
        setPaymentMethod(method);

        if (method === 'card') {
            setSelectedBank({ name: '', code: '' });
            setAccountNumber('');
        }

        if (method === 'bank') {
            setCardNum1('');
            setCardNum2('');
            setCardNum3('');
            setCardNum4('');
            setExpiryMonth('');
            setExpiryYear('');

            if (cardNum1Ref.current) cardNum1Ref.current.textContent = '';
            if (cardNum2Ref.current) cardNum2Ref.current.textContent = '';
            if (cardNum3Ref.current) cardNum3Ref.current.textContent = '';
            if (cardNum4Ref.current) cardNum4Ref.current.textContent = '';
            if (expiryMonthRef.current) expiryMonthRef.current.textContent = '';
            if (expiryYearRef.current) expiryYearRef.current.textContent = '';
        }
    };

    // 은행 선택 핸들러
    const handleBankSelect = (bankName, bankCode) => {
        console.log('은행 선택:', bankName, bankCode);
        setSelectedBank({ name: bankName, code: bankCode });
    };

    // 계좌이체 결제 처리
    const handleAccountTransfer = async () => {
        if (!isReady) {
            setErrorModal({
                isOpen: true,
                message: "잠시만 기다려주세요."
            });
            return;
        }

        setIsLoading(true);

        try {
            setIsEncrypting(true);

            // 생년월일 YYMMDD (userinfo의 residentFront 사용)
            const birthdateYYMMDD = personalData.residentFront || '';

            // 검증
            if (!birthdateYYMMDD || birthdateYYMMDD.length !== 6) {
                setErrorModal({
                    isOpen: true,
                    message: "생년월일 정보가 올바르지 않습니다."
                });
                return;
            }

            // 계좌이체 정보 암호화
            const encryptedPayment = await crypto.encryptHybrid({
                acntNo: accountNumber,
                dporCd: birthdateYYMMDD
            });

            console.log('=== 계좌이체 암호화 결과 ===');
            console.log('은행코드:', selectedBank.code);
            console.log('계좌번호 길이:', accountNumber.length);
            console.log('생년월일:', birthdateYYMMDD);
            console.log('===========================');

            // 계좌이체 API 호출
            const result = await submitPaymentContract({
                prctrNo: contractData.prctrNo,            // 가계약번호
                athNo: authData.athNo,                    // 본인인증번호
                dporNm: cardHolderName,                   // 예금주명
                rcptPrem: contractData?.indvBrdPrem || 0, // 영수보험료
                paymentMethod: 'bank',                    // 결제수단: 계좌이체
                bnkCd: selectedBank.code,                 // 은행코드
                bnkNm: selectedBank.name,                 // 은행명
                encryptedPayment: encryptedPayment        // 암호화된 계좌 정보
            }, setErrorModal);

            if (!result) return;

            // 결제 성공 - 결제완료 페이지로 이동 (NFT 민팅용 tid 전달)
            navigate(`/pay/complete/${result?.tid || 'unknown'}`, {
                state: {
                    rltLinkUrl4: result?.rltLinkUrl4
                }
            });

        } catch (error) {
            console.log('계좌이체 처리 오류:', error.message || error);
        } finally {
            setIsEncrypting(false);
            setIsLoading(false);
        }
    };

    // 카드 결제 처리
    const handleCardPayment = async () => {
        if (!isReady) {
            setErrorModal({
                isOpen: true,
                message: "잠시만 기다려주세요."
            });
            return;
        }

        setIsLoading(true);

        try {
            setIsEncrypting(true);

            // 카드번호 합치기
            const fullCardNumber = `${cardNum1}${cardNum2}${cardNum3}${cardNum4}`;

            // 유효기간 YYYYMM 형식으로 변환
            const currentYear = new Date().getFullYear();
            const century = Math.floor(currentYear / 100) * 100;
            const efctPrd = `${century + parseInt(expiryYear)}${expiryMonth.padStart(2, '0')}`;

            // 생년월일 YYMMDD (userinfo의 residentFront 사용)
            const birthdateYYMMDD = personalData.residentFront || '';

            // 검증
            if (!cardHolderName || cardHolderName.trim() === '') {
                console.log('예금주명이 비어있습니다.');
            }
            if (!birthdateYYMMDD || birthdateYYMMDD.length !== 6) {
                console.log('생년월일 형식 오류:', birthdateYYMMDD);
            }

            // 결제 정보 암호화
            const encryptedPayment = await crypto.encryptHybrid({
                crdNo: fullCardNumber,
                dporCd: birthdateYYMMDD
            });

            console.log('=== 카드 결제 암호화 결과 ===');
            console.log('카드번호 길이:', fullCardNumber.length);
            console.log('유효기간:', efctPrd);
            console.log('생년월일:', birthdateYYMMDD);
            console.log('===========================');

            // 결제 API 호출
            const result = await submitPaymentContract({
                prctrNo: contractData.prctrNo,            // 가계약번호
                athNo: authData.athNo,                    // 본인인증번호
                efctPrd: efctPrd,                         // 유효기간 YYYYMM
                dporNm: cardHolderName,                   // 예금주명
                rcptPrem: contractData?.indvBrdPrem || 0, // 영수보험료
                paymentMethod: 'card',                    // 결제수단
                encryptedPayment: encryptedPayment        // 암호화된 결제 정보
            }, setErrorModal);

            if (!result) return;

            // 결제 성공 - 결제완료 페이지로 이동 (NFT 민팅용 tid 전달)
            navigate(`/pay/complete/${result?.tid || 'unknown'}`, {
                state: {
                    rltLinkUrl4: result?.rltLinkUrl4
                }
            });

        } catch (error) {
            console.log('결제 처리 오류:', error.message || error);
        } finally {
            setIsEncrypting(false);
            setIsLoading(false);
        }
    };

    // 결제 처리 (결제 수단에 따라 분기)
    const handlePayment = async () => {
        if (paymentMethod === 'bank') {
            await handleAccountTransfer();
        } else {
            await handleCardPayment();
        }
    };

    return (
        <>
            <DisasterHeader title="실손보상 주택 풍수해·지진재해보험" backPath="/document" />
            {(isLoading || isEncrypting) && <Loading />}

            <div className={styles.payContainer}>
                <section className={styles.paySection}>
                    <h2>결제수단을 선택해주세요</h2>

                    {/* 결제수단 선택 탭 */}
                    <div className={styles.paymentMethodTabs}>
                        <ul>
                            <li
                                className={paymentMethod === 'card' ? styles.active : ''}
                                onClick={() => handlePaymentMethodChange('card')}
                            >
                                카드결제
                            </li>
                            <li
                                className={paymentMethod === 'bank' ? styles.active : ''}
                                onClick={() => handlePaymentMethodChange('bank')}
                            >
                                실시간 계좌이체
                            </li>
                        </ul>
                    </div>

                    {/* 카드 결제 폼 */}
                    {paymentMethod === 'card' && (
                        <div className={styles.paymentCard}>
                            <h3>본인명의의 카드정보를 입력해주세요</h3>

                            {/* 예금주명 */}
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

                    {/* 계좌이체 폼 */}
                    {paymentMethod === 'bank' && (
                        <div className={styles.paymentCard}>
                            <h3>본인명의의 계좌정보를 입력해주세요</h3>

                            {/* 예금주명 */}
                            <div className={styles.inputSection}>
                                <div className={styles.cardHolderWrapper}>
                                    <div className={styles.inputLabel}>예금주명</div>
                                    <input
                                        type="text"
                                        value={cardHolderName}
                                        onChange={(e) => setCardHolderName(e.target.value)}
                                        placeholder="예금주 이름"
                                        className={styles.cardHolderInput}
                                    />
                                </div>
                            </div>

                            {/* 은행 선택 */}
                            <div className={styles.inputSection}>
                                <div className={styles.bankSelectWrapper}>
                                    <div className={styles.inputLabel}>은행 선택</div>
                                    <button
                                        type="button"
                                        onClick={() => setIsBankModalOpen(true)}
                                        className={styles.bankSelectButton}
                                    >
                                        {selectedBank.name || '은행을 선택해주세요'}
                                    </button>
                                </div>
                            </div>

                            {/* 계좌번호 */}
                            <div className={styles.inputSection}>
                                <div className={styles.accountNumberWrapper}>
                                    <div className={styles.inputLabel}>계좌번호</div>
                                    <input
                                        type="text"
                                        value={accountNumber}
                                        onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                                        placeholder="계좌번호를 입력하세요"
                                        className={styles.cardHolderInput}
                                        maxLength={20}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                </section>
            </div>

            <SafetyButton
                buttonText={isLoading || isEncrypting ? "결제 처리 중..." : "결제하기"}
                onClick={handlePayment}
                disabled={
                    isLoading ||
                    isEncrypting ||
                    (paymentMethod === 'card' ? !isCardPaymentValid : !isBankPaymentValid)
                }
            />

            {errorModal.isOpen && (
                <ErrorModal
                    message={errorModal.message}
                    subMsg={errorModal.subMsg}
                    onClose={() => setErrorModal({ isOpen: false, message: "", subMsg: "" })}
                />
            )}

            {/* 은행 선택 모달 */}
            <BankSelectModal
                isOpen={isBankModalOpen}
                onClose={() => setIsBankModalOpen(false)}
                onSelectBank={handleBankSelect}
            />
        </>
    );
}

export default Pay;
