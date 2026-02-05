import React from "react";
import BaseModalBottom from "../../../components/layout/BaseModalBottom";
import styles from "../../../css/disasterSafeguard/workSpaceModal.module.css";
import cancel from "../../../assets/commonX.svg";

function WorkSpaceModal({
  title,
  subTitle,
  primaryBtnText,
  secondaryBtnText,
  primaryBtnOnClick,
  secondaryBtnOnClick,
  onClose,
}) {
  return (
    <BaseModalBottom onClose={onClose}>
      <button className={styles.closeButton} onClick={onClose}>
        <img src={cancel} alt="cancel" />
      </button>
      <div className={styles.modalHeader}>
        <h2 className={styles.title}>{title}</h2>
        <span className={styles.subTitle}>{subTitle}</span>
      </div>

      <div className={styles.buttonContainer}>
        <button
          className={`${styles.button} ${styles.primaryBtn}`}
          onClick={primaryBtnOnClick}
        >
          {primaryBtnText}
        </button>
        <button
          className={`${styles.button} ${styles.secondaryBtn}`}
          onClick={secondaryBtnOnClick}
        >
          {secondaryBtnText}
        </button>
      </div>
    </BaseModalBottom>
  );
}

export default WorkSpaceModal;
