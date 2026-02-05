import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import styles from "../../css/common/button.module.css";
import { useSelector } from "react-redux";
import LiteButton from "./LiteButton";
import { usePartner } from "../../hooks/usePartner";

function Button({
  buttonText = "확인하기",
  onClick,
  disabled,
  andColor,
  isFinishPath,
  showLiteButton,
  handleShowLite,
  showFloatingLogo = true, // 기본값을 true: 플로팅버튼을 on/off
}) {
  const location = useLocation();
  const hasDeparted = useSelector((state) => state.hasDeparted.isDeparted);
  const [hideFloating, setHideFloating] = useState(false);
  const appType = process.env.REACT_APP_TYPE || "";

  // usePartner 훅을 사용하여 필요한 파트너 정보만 가져오기
  const { isB2B, partnerConfig } = usePartner();
  const partnerCd = partnerConfig?.partner_cd

  // 현재 앱 타입 확인
  const isDepartedApp = appType === "DEPARTED";
  const isIndemnityPath = location.pathname === "/indemnity";

  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick();
  };

  const handleImageError = () => {
    setHideFloating(true); // 이미지 로드 실패 시 플로팅 컨테이너 숨김
  };

  const getButtonColor = () => {
    if (isDepartedApp) {
      // 출국 후 앱 색상 로직
      if (disabled) return "#B8DBFB";
      if (isFinishPath) return "#1F3A1E";
      return "#169AF5";
    } else {
      // 출국 전 앱 및 청구 앱 색상 로직
      if (disabled) return "#C3D2C3";
      if (andColor) return "#C3D2C3";
      if (isFinishPath) return "#1F3A1E";
      return "#386937";
    }
  };

  // 파트너 로고 URL 가져오기
  const logoUrl =
    isB2B && partnerConfig?.logo_url ? partnerConfig.logo_url : null;

  // 추가 조건: showFloatingLogo 상태값 확인
  const shouldShowFloating =
    isB2B && !hideFloating && logoUrl && showFloatingLogo;

  return (
    <div className="w-full pt-[90px]">
      <div className={styles.fixedWrapper}>
        {shouldShowFloating && (
          <div className={styles.floatingContainer}>
            <img
              src={logoUrl}
              alt={`${partnerConfig?.name || "파트너"} 로고`}
              className={ partnerCd === "cover1b2b" ? styles.coverfloating :styles.floatingImage}
              onError={handleImageError}
            />
          </div>
        )}
        <div className={styles.buttonContainer}>
          <div className={styles.buttonContent}>
            <LiteButton
              showLiteButton={showLiteButton}
              handleShowLite={handleShowLite}
              isIndemnityPath={isIndemnityPath}
              hasDeparted={hasDeparted}
            />
            <div className={styles.mainButton}>
              <button
                onClick={handleClick}
                className={styles.buttonStyle}
                style={{ backgroundColor: getButtonColor() }}
                disabled={disabled}
              >
                {buttonText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Button;
