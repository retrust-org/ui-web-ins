import React, { useState } from "react";
import styles from "../../css/disasterSafeguard/baseModalBottom.module.css";

function BaseModalBottom({ children, onClose }) {
  const [isClosing, setIsClosing] = useState(false);

  // 모달 닫기 공통 함수
  const closeWithAnimation = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  return (
    <div
      className={`${styles.bottomModalOverlay} ${
        isClosing ? styles.closing : ""
      }`}
    >
      <div
        className={`${styles.bottomModalContent} ${
          isClosing ? styles.closing : ""
        }`}
      >
        {typeof children === "function"
          ? children({ closeModal: closeWithAnimation })
          : children}
      </div>
    </div>
  );
}

export default BaseModalBottom;
