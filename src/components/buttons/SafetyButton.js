import React from "react";
import styles from "../../css/common/safetyButton.module.css";

function SafetyButton({ buttonText, onClick, disabled }) {
  return (
    <div className={styles.buttonContents}>
      <div className={styles.buttonWrapper}>
        <button
          className={`${styles.safetyButton} ${
            disabled ? styles.disabled : ""
          }`}
          onClick={onClick}
          disabled={disabled}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
}

export default SafetyButton;
