import React from "react";
import { useNavigate } from "react-router-dom";
import BaseModalBottom from "../../../../components/layout/BaseModalBottom";
import cancel from "../../../../assets/commonX.svg";
import manyEmployeeIcon from "../../../../assets/many-employee-icon.svg";
import smallEmployeeIcon from "../../../../assets/samll-employee-icon.svg";
import styles from "../../../../css/disasterSafeguard/employeeCountModal.module.css";

function EmployeeCountModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleClose = () => {
    navigate("/");
  };

  return (
    <BaseModalBottom onClose={onClose}>
      <button className={styles.closeButton} onClick={handleClose}>
        <img src={cancel} alt="닫기" />
      </button>
      <div className={styles.modalContent}>
        <h2 className={styles.modalTitle}>소상공인이신가요?</h2>
        <p className={styles.modalSubtitle}>
          소상공인이 아닌 경우 보험금 지급이 제한될 수 있으니 꼭 확인해주세요
        </p>
        <p className={styles.employeeCountLabel}>상시 근로자 수</p>

        <div className={styles.employeeOptions}>
          <div className={styles.employeeOption}>
            <div className={styles.employeeCount}>
              <img src={manyEmployeeIcon} alt="많은 직원" />
              <span>10명 미만</span>
            </div>
            <span className={styles.industryText}>광업,제조업,건설업,운수업</span>
          </div>

          <div className={styles.employeeOption}>
            <div className={styles.employeeCount}>
              <img src={smallEmployeeIcon} alt="적은 직원" />
              <span>5명 미만</span>
            </div>
            <span className={styles.industryText}>
              그 밖의 업종/<br />중소벤처기업부의 소상공인 확인서 소유자
            </span>
          </div>
        </div>

        <div className={styles.bottomSection}>
          <p className={styles.legalText}>중소기업기본법 제 2조 제2항에 따릅니다</p>
          <button className={styles.confirmButton} onClick={onClose}>
            네, 소상공인이예요
          </button>
        </div>
      </div>
    </BaseModalBottom>
  );
}

export default EmployeeCountModal;
