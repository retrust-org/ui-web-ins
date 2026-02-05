import React from "react";
import { useLocation } from "react-router-dom";
import styles from "../../css/common/errorModal.module.css";
import modalOverlay from "../../css/common/modalLayOut.module.css";
import errorModal from "../../assets/errorModal.svg";
import commonX from "../../assets/commonX.svg";

function SuggestionModal({
  onConfirm,
  onCancel,
  message,
  subMsg,
  confirmButtonText = "확인",
  cancelButtonText = "취소",
}) {
  const location = useLocation();
  const isRootPath = location.pathname === "/";

  return (
    <div className={modalOverlay.modalOverlay}>
      <div className={modalOverlay.modal_center}>
        <div className={styles.modalContentWrap}>
          {!isRootPath && (
            <div className={styles.commonX}>
              <img src={commonX} alt="닫기" onClick={onCancel} />
            </div>
          )}
          {!isRootPath && (
            <div className={styles.imageWrap}>
              <img src={errorModal} alt="Error" />
            </div>
          )}
          <h3 className={styles.title}>{message}</h3>
          <p className={styles.subTitle}>{subMsg}</p>
          <div className={styles.buttonWrap}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onCancel}
            >
              {cancelButtonText}
            </button>
            <button
              type="button"
              className={styles.confirmButton}
              onClick={onConfirm}
            >
              {confirmButtonText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuggestionModal;
