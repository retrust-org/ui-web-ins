import React from "react";
import BaseModalCenter from "../layout/BaseModalCenter";
import cancel from "../../assets/commonX.svg";
import styles from "../../css/modals/comingSoon.module.css";

function ComingSoonModal({ isOpen, onClose }) {
  console.log("ComingSoonModal - isOpen:", isOpen);
  if (!isOpen) return null;

  const handleConfirm = () => {
    window.location.href = "/";
  };

  const handleClose = () => {
    window.location.href = "/";
  };

  return (
    <BaseModalCenter isOpen={isOpen} onClose={handleClose}>
      <section className={styles.modalSection}>
        <div className={styles.closeButton}>
          <img src={cancel} alt="닫기" onClick={handleClose} />
        </div>
        <div className={styles.modalContent}>
          <img
            src="/images/MaintenanceModal-icon.png"
            alt="준비중"
            className={styles.modalIcon}
          />
          <h1 className={styles.modalTitle}>서비스 준비중입니다.</h1>
          <span>곧 해당 서비스를 만나보실 수 있어요</span>
        </div>
        <button className={styles.confirmButton} onClick={handleConfirm}>
          확인
        </button>
      </section>
    </BaseModalCenter>
  );
}

export default ComingSoonModal;