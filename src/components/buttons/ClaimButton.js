// ClaimButton.jsx
import React from "react";
import styles from "../../css/common/claimButton.module.css";

function ClaimButton({
  buttonText = "확인하기",
  onClick,
  disabled,
  isFinishPath,
}) {
  const handleClick = (e) => {
    e.preventDefault();
    if (onClick) onClick();
  };

  // 버튼 스타일 동적 적용
  const buttonStyle = {
    backgroundColor: disabled ? "rgb(195, 210, 195)" : "#386937",
  };

  return (
    <div className={styles.claimButtonContainer}>
      
      <button
        onClick={handleClick}
        className={styles.claimButton}
        style={buttonStyle}
        disabled={disabled}
      >
        {buttonText}
      </button>
    </div>
  );
}

export default ClaimButton;
