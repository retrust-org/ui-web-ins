import React, { useEffect, useState, useRef, useMemo } from "react";
import styles from "../../../css/claim/claimReferral.module.css";
import ClaimUtilsApi from "../../../data/ClaimUtilsApi";
import ClaimSubHeaders from "../components/ClaimHeader";
import SuggestionModal from "../../../components/modals/SuggestionModal";
import moment from "moment";
import ErrorModal from "../../../components/modals/ErrorModal";
import { useHomeNavigate } from "../../../hooks/useHomeNavigate";
import { useNavigate } from "react-router-dom";

function ClaimReferral() {
  ClaimUtilsApi();
  const [nftData, setNftData] = useState([]);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuggestionModal, setShowSuggestionModal] = useState(false);
  const [modalContent, setModalContent] = useState({
    message: "",
    subMsg: "",
    confirmButtonText: "",
    cancelButtonText: "",
    onConfirm: () => { },
    onCancel: () => { },
  });
  // const [nationNames, setNationNames] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [startX, setStartX] = useState(null);
  const sliderRef = useRef(null);
  const { navigateToHome } = useHomeNavigate();
  const navigate = useNavigate();

  // const filterNationName = () => {
  //   if (!nftData.length) return;

  //   const cityInfoData_Natlcd = CityinfoData?.map((e) => e.cityNatlCd);
  //   const nftCountry = nftData.map((e) => e.Contract?.trip_country);

  //   const filteredNationNames = nftCountry
  //     .filter((country) => cityInfoData_Natlcd.includes(country))
  //     .map((country) => {
  //       const matchingCity = CityinfoData.find((e) => e.cityNatlCd === country);
  //       return matchingCity?.korNatlNm || "Unknown Country";
  //     });
  //   setNationNames(filteredNationNames);
  // };

  useEffect(() => {
    const fetchIssueableCard = async () => {
      const requestOptions = {
        method: "GET",
        redirect: "follow",
      };

      try {
        const response = await fetch("/trip-api/api/v1/trip/issueableCard", requestOptions);
        const result = await response.json();
        if (!result[0].card_id) {
          setModalContent({
            message: "클립지갑을 등록해주세요.",
            subMsg: "NFT를 받고, 클립지갑을 등록해주세요.",
            confirmButtonText: "NFT 받기",
            cancelButtonText: "다음에",
            onConfirm: () => {
              setShowSuggestionModal(false);
              window.location.href =
                "/member-api/claimCard/" + result[0].Card.card_id;
            },
            onCancel: () => {
              setShowSuggestionModal(false);
              navigateToHome();
            },
          });
          setShowSuggestionModal(true);
        } else if (result.length === 0) {
          setModalContent({
            message: "보낼 엽서가 없습니다.",
            subMsg:
              "새로운 여행을 계획 해보세요. 간편 가입 서비스로 쉽게 떠나봐요",
            confirmButtonText: "가입하기",
            cancelButtonText: "다음에",
            onConfirm: () => {
              setShowSuggestionModal(false);
              navigate("/trip");
            },
            onCancel: () => {
              setShowSuggestionModal(false);
              navigateToHome();
            },
          });
          setShowSuggestionModal(true);
        } else {
          setNftData(result);
        }
      } catch (error) {
        console.error(error);
        setNftData([]);
      }
    };

    fetchIssueableCard();
  }, []);

  const sortedAndProcessedData = useMemo(() => {
    const getStartOfDay = () => {
      return moment().startOf("day").format("YYYYMMDD");
    };

    const startOfDay = getStartOfDay();

    return nftData
      .map((card) => {
        let status;
        if (card.Contract) {
          const insBgnDt = moment(
            card.Contract.insurance_start_date,
            "YYYYMMDD"
          );
          if (insBgnDt.isSameOrBefore(startOfDay)) {
            status = "정상";
          } else {
            status = "증권 개시전";
          }
        } else {
          status = "취소된 증권";
        }
        return { ...card, status };
      })
      .sort(
        (a, b) =>
          new Date(b.Contract?.insurance_start_date) -
          new Date(a.Contract?.insurance_start_date)
      );
  }, [nftData]);

  // useEffect(() => {
  //   filterNationName();
  // }, [nftData]);

  const handleStart = (clientX) => {
    setStartX(clientX);
  };

  const handleMove = (clientX) => {
    if (startX === null) return;

    const diff = startX - clientX;

    if (Math.abs(diff) > 50) {
      if (diff > 0 && currentIndex < nftData.length - 1) {
        setCurrentIndex((prevIndex) => prevIndex + 1);
      } else if (diff < 0 && currentIndex > 0) {
        setCurrentIndex((prevIndex) => prevIndex - 1);
      }
      setStartX(null);
    }
  };

  const handleEnd = () => {
    setStartX(null);
  };

  const handleTouchStart = (e) => handleStart(e.touches[0].clientX);
  const handleTouchMove = (e) => handleMove(e.touches[0].clientX);
  const handleMouseDown = (e) => handleStart(e.clientX);
  const handleMouseMove = (e) => {
    if (startX !== null) {
      handleMove(e.clientX);
    }
  };
  const handleMouseUp = handleEnd;

  const slideOnClick = (card_id, status) => {
    if (status === "정상") {
      navigate(`/claimReferral/${card_id}`, { state: { card_id, nftData } });
    } else {
      setShowErrorModal(true);
    }
  };

  // const sortedData = nftData.slice().sort((a, b) => {
  //   return (
  //     new Date(b.Contract?.insurance_start_date) -
  //     new Date(a.Contract?.insurance_start_date)
  //   );
  // });

  return (
    <>
      <ClaimSubHeaders titleText="엽서 보내기" />
      <div className={styles.Container}>
        <div className={styles.contentsTitle}>
          <div className={styles.title}>
            <span>InsuRETrust</span>
            <p>엽서보내기</p>
          </div>
        </div>
      </div>
      <div className={styles.Referral}>
        <div className={styles.ReferralWrap}>
          <div
            className={styles.nftList}
            ref={sliderRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleEnd}
            tabIndex="0"
          >
            {sortedAndProcessedData.map((e, i) => (
              <div
                className={`${styles.nftContainer} ${i === currentIndex ? styles.active : ""
                  }`}
                key={i}
                style={{
                  transform: `translateX(${(i - currentIndex) * 30}%) scale(${1 - Math.abs(i - currentIndex) * 0.1
                    })`,
                  zIndex:
                    sortedAndProcessedData.length - Math.abs(i - currentIndex),
                  opacity: 1 - Math.abs(i - currentIndex) * 0.2,
                  transition: "all 0.3s ease",
                }}
                onClick={() => slideOnClick(e.card_id, e.status)} // 슬라이드를 클릭하면 card_id를 사용하여 navigate 함수 호출
              >
                <div className={styles.ImageContents}>
                  <img src={e.imageUri} alt="" />
                  <div className={styles.nftInfo}>
                    <div className={styles.nftTitle}>
                      <p>{e.status}</p>
                      {/* <h2>{nationNames[i] || "Unknown Country"}</h2> */}
                      <h2>{e.nation || "Unknown Country"}</h2>
                    </div>
                    <div className={styles.date}>
                      <p>기간 :</p>
                      <p>
                        {e.Contract?.insurance_start_date}~
                        {e.Contract?.insurance_end_date}
                      </p>
                    </div>
                    <div className={styles.present}>
                      남은 엽서(기본제공 2장) : {e.remainingQuantity}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showSuggestionModal && (
        <SuggestionModal
          onConfirm={modalContent.onConfirm}
          onCancel={modalContent.onCancel}
          message={modalContent.message}
          subMsg={modalContent.subMsg}
          confirmButtonText={modalContent.confirmButtonText}
          cancelButtonText={modalContent.cancelButtonText}
        />
      )}
      {showErrorModal && (
        <ErrorModal
          message="보험이 개시되지 않았어요."
          subMsg="여행이 시작되면, 보낼 수 있어요. 조금만 기다려주세요."
          onClose={() => setShowErrorModal(false)}
        />
      )}
    </>
  );
}

export default ClaimReferral;
