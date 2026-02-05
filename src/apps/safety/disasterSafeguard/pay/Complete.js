import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import DisasterHeader from '../../../../components/headers/DisasterHeader';
import styles from '../../../../css/disasterSafeguard/payComplete.module.css';
import FinishCheck from '../../../../assets/FinishCheck.svg';
import QRCodeModal from '../../../../components/modals/QRCodeModal';
import WalletButton from '../../../../components/buttons/WalletButton';
import { useDisasterInsurance } from '../../../../context/DisasterInsuranceContext';

function Complete() {
    const { tid } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { updateCoverageAmounts, updateContractData } = useDisasterInsurance();

    // Pay 페이지에서 전달받은 데이터
    const { rltLinkUrl4 } = location.state || {};

    // NFT 관련 상태
    const [isLoading, setIsLoading] = useState(true);
    const [buttonText, setButtonText] = useState("NFT 생성중");
    const [isNFTReceived, setIsNFTReceived] = useState(false);
    const [cardId, setCardId] = useState("");
    const [insuranceId, setInsuranceId] = useState("");
    const [klipDeepLink, setKlipDeepLink] = useState(null);
    const [klipRequestId, setKlipRequestId] = useState("");
    const [goKlip, setGoKlip] = useState(null);
    const [isMobile, setIsMobile] = useState(false);
    const [showQRModal, setShowQRModal] = useState(false);
    const [qrCodeData, setQrCodeData] = useState(null);
    const [popupWindow, setPopupWindow] = useState(null);
    const [intervalId, setIntervalId] = useState(null);
    const [error, setError] = useState(null);
    const [showWalletButton, setShowWalletButton] = useState(false);
    const [appleWalletUrl, setAppleWalletUrl] = useState("");
    const [samsungWalletUrl, setSamsungWalletUrl] = useState("");

    // 에러 메시지를 사용자 친화적으로 변환
    const getUserFriendlyErrorMessage = (errorMessage) => {
        if (!errorMessage) return "알 수 없는 오류가 발생했습니다.";

        const message = errorMessage.toLowerCase();

        // 필수값 관련 오류
        if (message.includes("필수값") || message.includes("required")) {
            return "필수 입력 항목이 누락되었습니다. 잠시 후 다시 시도해주세요.";
        }

        // 유효기간 관련 오류
        if (message.includes("유효기간") || message.includes("yyyymm") || message.includes("expiry")) {
            return "보험 유효기간 형식이 올바르지 않습니다. 고객센터로 문의해주세요.";
        }

        // 날짜 형식 오류
        if (message.includes("날짜") || message.includes("date format")) {
            return "날짜 형식이 올바르지 않습니다. 고객센터로 문의해주세요.";
        }

        // 중복 오류
        if (message.includes("중복") || message.includes("duplicate")) {
            return "이미 처리된 요청입니다. 새로고침 후 확인해주세요.";
        }

        // 권한 오류
        if (message.includes("권한") || message.includes("unauthorized") || message.includes("forbidden")) {
            return "접근 권한이 없습니다. 고객센터로 문의해주세요.";
        }

        // 타임아웃 오류
        if (message.includes("timeout") || message.includes("시간초과")) {
            return "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.";
        }

        // NFT/Card 관련 오류
        if (message.includes("card not found") || message.includes("cardid")) {
            return "NFT 정보를 찾을 수 없습니다. 페이지를 새로고침 후 다시 시도해주세요.";
        }

        // 전송 실패
        if (message.includes("transfer") && message.includes("fail")) {
            return "NFT 전송에 실패했습니다. 잠시 후 다시 시도해주세요.";
        }

        // 네트워크 오류
        if (message.includes("network") || message.includes("연결")) {
            return "네트워크 연결을 확인하고 다시 시도해주세요.";
        }

        // 기본 메시지
        return "일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.";
    };

    // 결제 완료 후 가입금액과 보험기간 초기화
    useEffect(() => {
        // 가입금액을 추천값(2천만원)으로 초기화
        updateCoverageAmounts({
            bldgSbcAmt: 20000000,
            fclSbcAmt: 20000000,
            invnAsetSbcAmt: 20000000,
            instlMachSbcAmt: 20000000,
            activeFilter: "추천"
        });

        // 보험기간 초기화
        updateContractData({
            startDate: "",
            endDate: ""
        });

        console.log("✅ 결제 완료 후 가입금액 및 보험기간 초기화 완료");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // 마운트 시 1회만 실행 (의도적으로 빈 배열)

    // NFT 민팅 및 Klip 인증 초기화
    useEffect(() => {
        // 모바일 환경 감지
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || window.opera;
            setIsMobile(
                /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                    userAgent
                )
            );
        };

        const fetchKlipData = async () => {
            try {
                const response = await fetch("/auth/klip", {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                const result = await response.json();
                if (response.ok) {
                    const { deep_link, request_id } = result.data;
                    setKlipDeepLink(deep_link);
                    setKlipRequestId(request_id);
                } else {
                    throw new Error("Failed to fetch Klip data");
                }
            } catch (error) {
                console.error("Error fetching Klip data:", error);
                setError("Klip 데이터를 가져오는데 실패했습니다.");
            }
        };

        const fetchNFTData = async () => {
            try {
                // nft-server API 호출
                const response = await fetch(`/disaster-api/api/v3/nft/mint/${tid}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({
                        insurance: {},  // 빈 객체 - nft-server가 mrz_api_server에서 데이터 조회
                        product_cd: "17605",  // disasterSafeguard 상품 코드
                    }),
                });

                const result = await response.json();
                if (result.success && result.results && result.results.length > 0) {
                    const firstResult = result.results[0];

                    // 기본 데이터 설정
                    setCardId(firstResult.card_id_hex);
                    setInsuranceId(firstResult.insurance);
                    setGoKlip(firstResult.goKlip);

                    // Wallet URL은 항상 설정
                    setAppleWalletUrl(firstResult.apple_wallet_url || "");
                    setSamsungWalletUrl(firstResult.samsung_wallet_url || "");
                    setShowWalletButton(true);

                    // NFT 상태에 따른 버튼 텍스트만 결정
                    setIsLoading(false);
                    if (firstResult.message === "Already transferred") {
                        setIsNFTReceived(true);
                        setButtonText("NFT 보러가기");
                    } else {
                        setButtonText("NFT 받기");
                        fetchKlipData();
                    }
                } else {
                    console.error("NFT 민팅 실패:", result);
                    const errorMsg = result.message || result.error || "NFT 생성에 실패했습니다.";
                    setError(getUserFriendlyErrorMessage(errorMsg));
                    setIsLoading(false);
                    setButtonText("NFT 생성 실패");
                }
            } catch (error) {
                console.error("NFT 민팅 오류:", error);
                const errorMsg = error.message || "NFT 생성 중 오류가 발생했습니다.";
                setError(getUserFriendlyErrorMessage(errorMsg));
                setIsLoading(false);
                setButtonText("NFT 생성 실패");
            }
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        // tid가 있을 때만 NFT 민팅 시도
        if (tid && tid !== 'unknown') {
            fetchNFTData();
        } else {
            setIsLoading(false);
            setButtonText("NFT 생성 불가");
            setError("결제 정보가 없어 NFT를 생성할 수 없습니다.");
        }

        return () => window.removeEventListener("resize", checkMobile);
    }, [tid]);

    // Klip 팝업 열기
    const openPopupWindow = (url) => {
        if (popupWindow && !popupWindow.closed) {
            popupWindow.close();
        }
        if (intervalId) {
            clearInterval(intervalId);
        }

        const width = window.innerWidth * 0.9;
        const height = window.innerHeight * 0.9;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
            url,
            "KlipLogin",
            `width=${width},height=${height},left=${left},top=${top}`
        );
        setPopupWindow(popup);

        const newIntervalId = setInterval(() => {
            if (popup.closed) {
                clearInterval(newIntervalId);
                setIntervalId(null);
                setPopupWindow(null);
            }
        }, 1000);

        setIntervalId(newIntervalId);

        setTimeout(() => {
            if (popup && !popup.closed) {
                popup.close();
            }
            clearInterval(newIntervalId);
            setIntervalId(null);
            setPopupWindow(null);
        }, 5 * 1000);
    };

    // NFT 받기 처리
    const handleNFTReceive = async () => {
        if (isNFTReceived) {
            // 이미 받은 경우 Klip 앱으로 이동
            if (goKlip) {
                if (isMobile) {
                    window.open(goKlip, '_blank');
                } else {
                    // PC에서는 QR 코드 모달 표시
                    setQrCodeData(goKlip);
                    setShowQRModal(true);
                }
            }
            return;
        }

        setError(null);
        try {
            if (isMobile) {
                openPopupWindow(klipDeepLink);
            } else {
                setQrCodeData(klipDeepLink);
                setShowQRModal(true);
            }

            const addressResponse = await fetch(
                `/auth/klip_result?requestId=${klipRequestId}`,
                {
                    method: "GET",
                }
            );

            const addressResult = await addressResponse.json();

            if (addressResponse.ok) {
                if (popupWindow) {
                    popupWindow.close();
                }

                if (intervalId) {
                    clearInterval(intervalId);
                    setIntervalId(null);
                }

                // cardId는 이미 16진수 문자열 (0x 없음)
                const sendNFTResponse = await fetch(
                    `/disaster-api/api/v3/nft/transfer/${cardId}`,
                    {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({
                            recipientAddress: addressResult.klaytn_address,
                        }),
                    }
                );

                if (sendNFTResponse.ok) {
                    setButtonText("NFT 보러가기");
                    setKlipDeepLink(goKlip);
                    setIsNFTReceived(true);
                    setShowQRModal(false);  // 전송 완료 시 모달 닫기
                } else {
                    const errorResult = await sendNFTResponse.json().catch(() => ({}));
                    const errorMsg = errorResult.message || errorResult.error || "NFT 전송에 실패했습니다.";
                    setError(getUserFriendlyErrorMessage(errorMsg));
                    setIsNFTReceived(false);
                }
            }
        } catch (error) {
            console.error("NFT 전송 오류:", error);
            setError("NFT 전송 중 오류가 발생했습니다.");
            setIsNFTReceived(false);
        }
    };

    // 가입증명서 보러가기
    const handleCertificate = () => {
        if (rltLinkUrl4) {
            window.open(rltLinkUrl4, '_blank');
        } else {
            alert('가입증명서 URL을 찾을 수 없습니다.');
        }
    };

    return (
        <>
            <DisasterHeader title="실손보상 소상공인 풍수해·지진재해보험" hideBackButton />
            <div className={styles.completeContainer}>
                <section className={styles.completeSection}>
                    <div className={styles.iconWrapper}>
                        <img src={FinishCheck} alt="완료" />
                    </div>

                    <h2>결제가 완료되었습니다</h2>
                    <p>
                        보험 가입이 성공적으로 완료되었습니다.<br />
                        가입증명서를 확인해주세요.
                    </p>

                    {error && (
                        <p style={{ color: 'red', fontSize: '14px', marginTop: '10px' }}>
                            {error}
                        </p>
                    )}

                    <div className={styles.buttonGroup}>
                        <button
                            className={styles.certificateButton}
                            onClick={handleCertificate}
                        >
                            가입증명서 보러가기
                        </button>
                        <button
                            className={styles.nftButton}
                            onClick={handleNFTReceive}
                            disabled={isLoading}
                        >
                            {buttonText}
                            {isLoading && (
                                <span style={{ marginLeft: '5px' }}>...</span>
                            )}
                        </button>
                        {showWalletButton && <WalletButton appleWalletUrl={appleWalletUrl} samsungWalletUrl={samsungWalletUrl} />}
                    </div>
                </section>

                <div className={styles.homeLinkWrapper}>
                    <span
                        className={styles.homeLink}
                        onClick={() => navigate('/')}
                    >
                        홈으로
                    </span>
                </div>
            </div>

            {/* QR 코드 모달 (PC 환경) */}
            {showQRModal && (
                <QRCodeModal
                    onClose={() => setShowQRModal(false)}
                    qrCodeData={qrCodeData}
                />
            )}
        </>
    );
}

export default Complete;
