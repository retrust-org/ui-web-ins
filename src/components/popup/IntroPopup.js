import React, { useEffect, useState } from "react";
import styles from "../../css/common/IntroPopup.module.css";
import { usePartner } from "../../hooks/usePartner";


function IntroPopup({ onClose, onHideForToday, onPopupLoaded }) {
  const { partnerConfig } = usePartner();
  const [imageLoaded, setImageLoaded] = useState(false);
  const partnerCd = partnerConfig?.partner_cd

  // 호스트명이 coverb2b일 때 coverPopup.png, 아니면 IntroPopup.png
  const imageSrc = partnerCd === "cover1b2b" ? "/images/coverPopup.png" : "/images/IntroPopup.png";

  // 팝업이 표시될 때 배경 스크롤 방지
  useEffect(() => {
    // 스크롤 방지
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  // 이미지 로드 완료 핸들러
  const handleImageLoad = () => {
    // 이미지 로딩 완료 후 300ms 딜레이를 주고 팝업 표시
    setTimeout(() => {
      setImageLoaded(true);
      // 부모 컴포넌트에 팝업 로딩 완료 알림
      if (onPopupLoaded) {
        onPopupLoaded();
      }
    }, 300);
  };

  // 이미지 로드 실패 시에도 팝업 표시
  const handleImageError = () => {
    setTimeout(() => {
      setImageLoaded(true);
      // 부모 컴포넌트에 팝업 로딩 완료 알림
      if (onPopupLoaded) {
        onPopupLoaded();
      }
    }, 300);
  };

  return (
    <>
      {/* 이미지 미리 로딩 (화면에 표시되지 않음) */}
      <img
        src={imageSrc}
        alt=""
        style={{ display: "none" }}
        onLoad={handleImageLoad}
        onError={handleImageError}
      />

      {/* 이미지 로딩 완료 후에만 팝업 표시 */}
      {imageLoaded && (
        <>
          {/* 팝업 배경 오버레이 */}
          <div className={styles.overlay}></div>

          {/* 팝업 메인 컨테이너 */}
          <div className={styles.popupContainer}>
            <div className={styles.popupContent}>
              {/* 호스트명에 따라 다른 이미지 표시 */}
              <img
                src={imageSrc}
                alt="메인팝업 이미지"
                className={styles.popupImage}
              />

              {/* 팝업 하단 버튼 영역 */}
              <div className={styles.buttonContainer}>
                <button
                  className={styles.hideForTodayButton}
                  onClick={onHideForToday}
                >
                  오늘 하루 보지 않기
                </button>
              </div>
            </div>

            {/* 팝업 닫기 버튼 (X 아이콘) */}
            <button className={styles.closeButton} onClick={onClose}>
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M18 6L6 18M6 6L18 18"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>
          </div>
        </>
      )}
    </>
  );
}

export default IntroPopup;