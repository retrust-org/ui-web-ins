import React from "react";
import { useLocation } from "react-router-dom";
import styles from "../../css/common/errorModal.module.css";
import errorModal from "../../assets/errorModal.svg";
import commonX from "../../assets/commonX.svg";
import modalOverlay from "../../css/common/modalLayOut.module.css";

function ErrorModal({ message, onClose, subMsg, errorMessage }) {
  const location = useLocation();
  const appType = process.env.REACT_APP_TYPE || "";
  const isDepartedApp = appType === "DEPARTED";

  // 가입 프로세스 체크
  const isSignupProcess =
    location.pathname.startsWith("/signup") ||
    location.pathname.startsWith("/overseas") ||
    location.pathname.startsWith("/departed");

  const getModalImage = () => {
    // 출국 후 앱이고 가입 프로세스인 경우에만 출국 후 에러 모달 이미지 사용
    if (isDepartedApp && isSignupProcess) {
      return <img src="/images/dp_errorModal.png" alt="출국 후 에러모달" />;
    }
    // 그 외 모든 경우
    return <img src={errorModal} alt="공통 에러 모달" />;
  };

  const getButtonColor = () => {
    // 출국 후 앱이고 가입 프로세스인 경우에만 파란색
    if (isDepartedApp && isSignupProcess) {
      return "#169AF5";
    }
    // 그 외 모든 경우
    return "#386937";
  };

  return (
    <div className={modalOverlay.modalOverlay}>
      <div className={modalOverlay.modal_center}>
        <div className={styles.contents}>
          <div className={styles.commonX}>
            <img src={commonX} alt="닫기" onClick={onClose} />
          </div>
          <div className={styles.imageWrap}>{getModalImage()}</div>
          <h3 className={styles.title}>{message || errorMessage}</h3>
          <p className={styles.subTitle}>{subMsg}</p>
          <button
            type="button"
            className={styles.confirmButton}
            onClick={onClose}
            style={{ backgroundColor: getButtonColor() }}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}

export default ErrorModal;
