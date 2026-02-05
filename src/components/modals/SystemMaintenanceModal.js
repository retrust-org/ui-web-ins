import React from "react";
import layoutStyles from "../../css/common/modalLayOut.module.css";
import styles from "../../css/modals/systemMaintenance.module.css";
import closeIcon from "../../assets/commonX.svg";

function SystemMaintenanceModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className={layoutStyles.modalOverlay}
        onClick={onClose}
      >
        <div className={layoutStyles.modal_center_secondary} onClick={(e) => e.stopPropagation()}>
          <div>
            <img
              src={closeIcon}
              alt="닫기"
              onClick={onClose}
              className={styles.closeButton}
            />
          </div>
          <h3 className={styles.title}>시스템 점검 안내</h3>
          <img
            src="/images/MaintenanceModal-icon.png"
            alt="시스템 점검"
            className={styles.maintenanceIcon}
          />
          <p className={styles.content}>
            보험사 정기점검으로 인해
            <br />
            서비스 이용이 일시 중단됩니다.
          </p>
          <p className={styles.text_secondary}>이용에 불편을 드려 죄송합니다.</p>

          <div className={styles.times}>
            <p>점검기간</p>
            <span className={styles.dateinfo}>2025년 9월 20일 (토) 오후 9시 ~
              <br />
              2025년 9월 21일 (일) 오전 9시  (12시간)</span>
            <span className={styles.warning}>점검 상황에 따라 종료 시간이 다소 지연될 수 있습니다.</span>
          </div>
        </div>
      </div>
    </>
  );
}

export default SystemMaintenanceModal;