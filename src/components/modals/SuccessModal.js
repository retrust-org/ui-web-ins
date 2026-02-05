import React from "react";
import styles from "../../css/common/claimRevocationSuccess.module.css";
import claimSuccessChk from "../../assets/claimSuccessChk.svg";
import commonX from "../../assets/commonX.svg";

function SuccessModal({ message, onClose }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalWrap}>
          <div className={styles.commonX}>
            <img src={commonX} alt="닫기" onClick={onClose} />
          </div>
          <img src={claimSuccessChk} alt="claimSuccessChk" />
          <div className={styles.modalTitle}>
            <span>{message}</span>
            <span>성공적으로 완료했습니다.</span>
          </div>
          <div className={styles.buttonWrap}>
            <button onClick={onClose}>확인</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SuccessModal;
