import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/headers/disasterHeader.module.css";

function DisasterHeader({ title, backPath, onBack, highZIndex = false, hideBackButton = false }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backPath) {
      navigate(backPath);
    } else if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`${styles.disasterHeaderContainer} ${highZIndex ? styles.highZIndex : ''}`}>
      <div className={styles.disasterHeaderContent}>
        {!hideBackButton && (
          <button className={styles.backButton} onClick={handleBack}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="19"
              viewBox="0 0 18 19"
              fill="none"
            >
              <path
                d="M13 18L5 10L13 2"
                stroke="#4A4A4A"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}
        <h1 className={styles.disasterHeaderTitle}>{title}</h1>
      </div>
    </div>
  );
}

export default DisasterHeader;
