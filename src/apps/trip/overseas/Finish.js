import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import styles from "../../../css/trip/finsh.module.css";
import { FinishSVG } from "../../../components/svgIcons/RestFinishSVG";
import ModalFinish from "./ModalFinish";
import FinishCheck from "../../../assets/FinishCheck.svg";
import QRCodeModal from "../../../components/modals/QRCodeModal";
import ButtonPartner from "../../../components/buttons/ButtonPartner";
import WalletButton from "../../../components/buttons/WalletButton";

function Finish() {
  const { tid } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const { natlCd, nation, city, start_date, end_date } =
    Object.fromEntries(searchParams);
  const [showModal, setShowModal] = useState(true);
  const [buttonText, setButtonText] = useState("NFT 생성중");
  const [isNFTReceived, setIsNFTReceived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [cardId, setCardId] = useState("");
  const [insuranceId, setInsuranceId] = useState("");
  const [popupWindow, setPopupWindow] = useState(null);
  const [intervalId, setIntervalId] = useState(null);
  const [showQRModal, setShowQRModal] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [klipRequestId, setKlipRequestId] = useState("");
  const [klipDeepLink, setKlipDeepLink] = useState(null);
  const [goKlip, setGoKlip] = useState(null);
  const [error, setError] = useState(null);
  const [partnerId, setPartnerId] = useState("");
  const [showWalletButton, setShowWalletButton] = useState(false);
  const [appleWalletUrl, setAppleWalletUrl] = useState("");
  const [samsungWalletUrl, setSamsungWalletUrl] = useState("");

  // 환경 변수 기반 파트너 로고 표시 로직
  useEffect(() => {
    // 현재 앱 타입 확인 (환경 변수에서 가져옴)
    const appType = process.env.REACT_APP_TYPE;

    // 파트너 로고 표시 여부 결정 - PARTNER 타입일 때만 표시
    const shouldShowPartnerLogo = appType === "PARTNER";

    // URL 경로에서 파트너 정보 추출 (PARTNER 타입일 때만)
    if (shouldShowPartnerLogo) {
      const path = window.location.pathname;
      const partnerMatch = path.match(/^\/*(?:\/|)(part[1-6])/);
      const extractedId = partnerMatch ? partnerMatch[1] : "";

      // 파트너 ID 매핑
      if (extractedId) {
        let subdomain;
        switch (extractedId) {
          case "part1":
            subdomain = "finb2b";
            break;
          case "part2":
            subdomain = "snowb2b";
            break;
          case "part3":
            subdomain = "astripb2b";
            break;
          case "part4":
            subdomain = "nzerob2b";
            break;
          case "part5":
            subdomain = "pinkb2b";
            break;
          case "part6":
            subdomain = "testb2b";
            break;
          default:
            subdomain = process.env.REACT_APP_DEFAULT_PARTNER || "testb2b";
        }

        setPartnerId(subdomain);
      }
    }
  }, [location.pathname]);

  const cardData = JSON.stringify({
    natlCd: natlCd,
    nation: nation,
    city: city,
    start_date: start_date,
    end_date: end_date,
  });

  useEffect(() => {
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
          setShowModal(false);
        } else {
          throw new Error("Failed to fetch Klip data");
        }
      } catch (error) {
        console.error("Error fetching Klip data:", error);
        setError("Klip 데이터를 가져오는데 실패했습니다.");
      }
    };

    const fetchData = async () => {
      try {
        const response = await fetch(`/trip-api/api/v2/nft/mint/${tid}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            tripInfo: {
              natlCd: natlCd,
              nation: nation,
              city: city,
              start_date: start_date,
              end_date: end_date,
            },
            product_cd: window.productCd,
          }),
        });

        const result = await response.json();
        if (result.success) {
          const firstResult = result.results[0];
          setCardId(firstResult.card_id_hex);
          setInsuranceId(firstResult.insurance);
          setGoKlip(firstResult.goKlip);
          setAppleWalletUrl(firstResult.apple_wallet_url || "");
          setSamsungWalletUrl(firstResult.samsung_wallet_url || "");
          fetchKlipData();
          setIsLoading(false);
          setButtonText("NFT 받기");
          setShowWalletButton(true);
        } else {
          console.error("Error:", result);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();

    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || window.opera;
      setIsMobile(
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          userAgent
        )
      );
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const openModal = () => {
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
  };

  const openKlipModal = () => {
    setShowModal(false);
    if (isMobile) {
      openPopupWindow(klipDeepLink);
    } else {
      setShowQRModal(true);
    }
  };

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

  const handleNFTReceive = async () => {
    setError(null);
    try {
      if (isMobile) {
        openPopupWindow(klipDeepLink);
      } else {
        setShowQRModal(true);
      }
      if (!isNFTReceived) {
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

          const sendNFTResponse = await fetch(
            `/card-api/api/v1/nft/transfer/${insuranceId}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                card_id: cardId,
                address: addressResult.klaytn_address,
              }),
            }
          );

          if (sendNFTResponse.ok) {
            const result = await sendNFTResponse.json();
            setButtonText("NFT 보러가기");
            setKlipDeepLink(goKlip);
            setIsNFTReceived(true);
          } else {
            setIsNFTReceived(false);
          }
        }
      }
    } catch (error) {
      setIsNFTReceived(false);
    }
  };

  useEffect(() => {
    if (isNFTReceived) {
      sessionStorage.removeItem("reduxState");
      if (showQRModal) {
        setShowQRModal(false);
      }
      setShowModal(true);
    }
  }, [isNFTReceived]);

  return (
    <>
      <section className={styles.FinishWrap}>
        <div className={styles.FinishIcon}>
          <FinishSVG />
        </div>
        <div>
          <h3 className={styles.h3_Finish}>"보험가입이 완료 되었습니다."</h3>
          <p className={styles.p_Finish}>
            가입 확인서는 이메일로 발송되었습니다.
          </p>
        </div>
        <WalletButton
          appleWalletUrl={appleWalletUrl}
          samsungWalletUrl={samsungWalletUrl}
          show={showWalletButton}
        >
          <div
            className={styles.buttonWrapper}
            style={{
              backgroundImage: `url('/images/Btn.png')`,
            }}
          >
            <button
              className={styles.button}
              disabled={isLoading}
              onClick={isLoading ? null : handleNFTReceive}
            >
              <div className={styles.buttonContent}>
                {!isLoading && (
                  <img
                    src={FinishCheck}
                    alt="Check"
                    className={styles.checkImage}
                  />
                )}
                <span className={styles.buttonText}>{buttonText}</span>
                {isLoading && (
                  <div className={styles.loading}>
                    <span className={styles.dotAnimation}>.</span>
                    <span className={styles.dotAnimation}>.</span>
                    <span className={styles.dotAnimation}>.</span>
                  </div>
                )}
              </div>
            </button>
          </div>
        </WalletButton>
        <p className={styles.FinishText}>
          잠시만 기다려주세요 <br /> NFT발급에 5초~ 1분까지 걸릴 수 있어요!
        </p>
      </section>
      <ButtonPartner />

      <div>
        <p className={styles.bottomText} onClick={openModal}>
          기다리는 동안 알아보기
        </p>
      </div>
      {showModal && (
        <ModalFinish
          isOpen={showModal}
          onClose={closeModal}
          isNFTReceived={isNFTReceived}
          goKlip={openKlipModal}
        />
      )}
      {showQRModal && (
        <QRCodeModal
          onClose={() => setShowQRModal(false)}
          qrCodeData={klipDeepLink}
        />
      )}
    </>
  );
}

export default Finish;
