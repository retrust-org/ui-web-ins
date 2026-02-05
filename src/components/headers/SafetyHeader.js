import React from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../css/headers/safetyHeader.module.css";

function SafetyHeader({ title, onBack, highZIndex = false }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  return (
    <div className={`${styles.safetyHeaderContainer} ${highZIndex ? styles.highZIndex : ''}`}>
      <div className={styles.safetyHeaderContent}>
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
        <h1 className={styles.safetyHeaderTitle}>{title}</h1>
      </div>
    </div>
  );
}

export default SafetyHeader;
