import React from "react";
import styles from "../../css/common/SucceedModal.module.css";
import commonX from "../../assets/commonX.svg";
import { QRCodeSVG } from "qrcode.react";

function QRCodeModal({ onClose, qrCodeData }) {
  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalWrap}>
          <div className={styles.commonX}>
            <img src={commonX} alt="닫기" onClick={onClose} />
          </div>
          <div className={styles.modalTitle}>
            <p>QR 코드를 스캔하세요</p>
          </div>
          <QRCodeSVG value={qrCodeData} size={256} />
          <div className={styles.TextContent}>
            <p>모바일에서 실행해 주세요!</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default QRCodeModal;
