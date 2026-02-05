import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDisasterHouse } from '../../../../context/DisasterHouseContext';
import { useSession } from '../../../../context/SessionContext';
import SafetyButton from '../../../../components/buttons/SafetyButton';
import styles from '../../../../css/disasterHouse/document.module.css';
import commonCheck from '../../../../assets/commonCheck.svg';
import commonActiveChk from '../../../../assets/commonActiveChk.svg';
import DisasterHeader from '../../../../components/headers/DisasterHeader';
import ErrorModal from '../../../../components/modals/ErrorModal';

function Document() {
    const navigate = useNavigate();
    const { contractData } = useDisasterHouse();
    const { sessionToken, clearSession } = useSession();
    const [isSigned1, setIsSigned1] = useState(false);  // 상품안내서 서명 완료
    const [isSigned2, setIsSigned2] = useState(false);  // 청약서 서명 완료
    const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

    // postMessage로 서명 완료 이벤트 수신
    useEffect(() => {
        const handleMessage = (event) => {
            // origin 검증
            if (!event.origin.includes('retrust.world')) {
                return;
            }

            // 메시지 형식 검증
            if (!event.data || typeof event.data !== 'object') {
                return;
            }

            const { type, documentType, redirectTo } = event.data;

            // 서명 완료 메시지 처리
            if (type === 'SIGNATURE_COMPLETE') {
                if (documentType === 'product_guide' && !isSigned1) {
                    setIsSigned1(true);
                } else if (documentType === 'subscription' && !isSigned2) {
                    setIsSigned2(true);
                }
            }

            // 세션 만료 메시지 처리
            if (type === 'SESSION_EXPIRED') {
                clearSession();
                navigate(redirectTo || '/price');
            }
        };

        window.addEventListener('message', handleMessage);

        return () => {
            window.removeEventListener('message', handleMessage);
        };
    }, [isSigned1, isSigned2, clearSession, navigate]);

    // 상품안내서 전자서명 (새창) - rltLinkUrl1
    const handleOpenDoc1 = () => {
        // sessionToken 확인
        if (!sessionToken) {
            setErrorModal({
                isOpen: true,
                message: "세션이 만료되었습니다.\n처음부터 다시 진행해주세요."
            });
            return;
        }

        // 전자서명 URL 확인
        if (!contractData?.rltLinkUrl1) {
            setErrorModal({
                isOpen: true,
                message: "전자서명 문서를 불러올 수 없습니다.\n가입 정보를 먼저 확인해주세요."
            });
            return;
        }

        const url = `${contractData.rltLinkUrl1}?sessionToken=${encodeURIComponent(sessionToken)}`;
        window.open(url, 'signaturePopup1', 'width=900,height=700');
    };

    // 청약서 전자서명 (새창) - rltLinkUrl2
    const handleOpenDoc2 = () => {
        // sessionToken 확인
        if (!sessionToken) {
            setErrorModal({
                isOpen: true,
                message: "세션이 만료되었습니다.\n처음부터 다시 진행해주세요."
            });
            return;
        }

        // 전자서명 URL 확인
        if (!contractData?.rltLinkUrl2) {
            setErrorModal({
                isOpen: true,
                message: "전자서명 문서를 불러올 수 없습니다.\n가입 정보를 먼저 확인해주세요."
            });
            return;
        }

        const url = `${contractData.rltLinkUrl2}?sessionToken=${encodeURIComponent(sessionToken)}`;
        window.open(url, 'signaturePopup2', 'width=900,height=700');
    };

    // 다음 단계로 이동
    const handleNext = () => {
        navigate('/pay');
    };

    return (
        <>
            {errorModal.isOpen && (
                <ErrorModal
                    message={errorModal.message}
                    onClose={() => setErrorModal({ isOpen: false, message: "" })}
                />
            )}
            <DisasterHeader title="실손보상 주택 풍수해·지진재해보험" backPath="/confirm" />
            <div className={styles.container}>
                <section className={styles.section}>
                    <h2 className={styles.title}>전자서명을 진행해주세요</h2>

                    {/* 상품안내서 전자서명 - rltLinkUrl1 */}
                    <div
                        className={`${styles.docItem} ${isSigned1 ? styles.active : ''}`}
                        onClick={handleOpenDoc1}
                    >
                        <img
                            src={isSigned1 ? commonActiveChk : commonCheck}
                            alt="checkbox"
                            className={styles.checkbox}
                        />
                        <span className={styles.docText}>
                            {isSigned1 ? '상품안내서 서명완료' : '상품안내서 전자서명'}
                        </span>
                    </div>

                    {/* 청약서 전자서명 - rltLinkUrl2 */}
                    <div
                        className={`${styles.docItem} ${isSigned2 ? styles.active : ''}`}
                        onClick={handleOpenDoc2}
                    >
                        <img
                            src={isSigned2 ? commonActiveChk : commonCheck}
                            alt="checkbox"
                            className={styles.checkbox}
                        />
                        <span className={styles.docText}>
                            {isSigned2 ? '청약서 서명완료' : '청약서 전자서명'}
                        </span>
                    </div>
                </section>
            </div>

            <SafetyButton
                buttonText="다음으로"
                onClick={handleNext}
                disabled={!isSigned1 || !isSigned2}
            />
        </>
    );
}

export default Document;
