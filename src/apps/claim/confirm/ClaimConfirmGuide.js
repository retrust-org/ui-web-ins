import React, { useState, useEffect } from "react";
import styles from "../../../css/claim/claimConfirm.module.css";
import guide from "../../../assets/guide.svg";

function ClaimConfirmGuide() {
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    const storedState = sessionStorage.getItem("claimConfirmGuideState");
    if (storedState) {
      const { isOpen } = JSON.parse(storedState);
      setIsOpen(isOpen);
    }
  }, []);

  const updateState = (open) => {
    setIsOpen(open);
    sessionStorage.setItem(
      "claimConfirmGuideState",
      JSON.stringify({ isOpen: open })
    );
  };

  const toggleGuide = () => updateState(!isOpen);

  return (
    <div className={styles.guideContainer}>
      <div className={styles.guideContent}>
        {isOpen ? (
          <div className={styles.modalOverlay}>
            <div className={styles.modal}>
              <div className={styles.modalContent}>
                <button onClick={toggleGuide} className={styles.closeButton}>
                  &times;
                </button>
                <h4 className={styles.modalTitle}>[청구 조회 안내]</h4>
                <p className={styles.modalText}>
                  임시접수건 안내: 14시 이후, 영업외 접수 건은 영업일 기준
                  <br />
                  1일 후 조회가 가능 합니다.
                </p>
                <p className={styles.modalText}>
                  재물배상 청구 건은 알림톡을 통해서만 안내되고 있습니다.
                </p>
                <p></p>
              </div>
            </div>
          </div>
        ) : (
          <button onClick={toggleGuide} className={styles.floatingButton}>
            <img src={guide} alt="Open Guide" className={styles.buttonIcon} />
          </button>
        )}
      </div>
    </div>
  );
}

export default ClaimConfirmGuide;
