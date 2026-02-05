import React from "react";
import styles from "../../css/common/errorModal.module.css";
import layoutStyles from "../../css/common/modalLayOut.module.css";
import errorModal from "../../assets/errorModal.svg";
import commonX from "../../assets/commonX.svg";

function DisclaimerModal({ onConfirm, onCancel, message, subMsg }) {
  return (
    <div className={layoutStyles.modalOverlay}>
      <div
        className={layoutStyles.modal_center}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.modalContentWrap}>
          <div className={styles.commonX}>
            <img src={commonX} alt="닫기" onClick={onCancel} />
          </div>
          <div className={styles.imageWrap}>
            <img src={errorModal} alt="Error" />
          </div>
          <h3 className={styles.title}>{message}</h3>
          <p className={styles.subTitle}>{subMsg}</p>
          <div className={styles.buttonWrap}>
            <button
              type="button"
              className={styles.confirmButton}
              onClick={onConfirm}
            >
              확인
            </button>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
            >
              돌아가기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DisclaimerModal;
