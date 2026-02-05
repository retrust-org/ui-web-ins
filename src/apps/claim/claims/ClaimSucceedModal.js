import React from "react";
import styles from "../../../css/claim/SucceedModal.module.css";
import claimSuccessChk from "../../../assets/claimSuccessChk.svg";
import commonX from "../../../assets/commonX.svg";
import { useNavigate } from "react-router-dom";

function ClaimSucceedModal({ onClose, message, arrayResultData }) {
  const navigate = useNavigate();

  const handleConfirmClick = () => {
    window.location.href = "/";
  };

  const handleContinueClick = () => {
    navigate("/claimMembersIntro");
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalWrap}>
          <div className={styles.commonX}>
            <img src={commonX} alt="닫기" onClick={onClose} />
          </div>
          <img src={claimSuccessChk} alt="claimSuccessChk" />
          <div className={styles.modalTitle}>
            <p>{message}</p>
            <p>가 완료되었습니다.</p>
          </div>

          <div className={styles.buttonWrap}>
            <button onClick={handleConfirmClick}>확인</button>
            <button onClick={handleContinueClick}>청구(계속)</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ClaimSucceedModal;
