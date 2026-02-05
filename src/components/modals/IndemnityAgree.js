// IndemnityAgree.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import modalLayOut from "../../css/common/modalLayOut.module.css";
import styles from "../../css/trip/insertModal.module.css";
import commonX from "../../assets/commonX.svg";

const IndemnityAgree = ({ isOpen, onClose, onAgree }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const options = ["다음에", "동의하고 가입"];
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleOptionClick = (option) => {
    setSelectedOption(option);
    if (option === "동의하고 가입") {
      onAgree(true);
    } else {
      onAgree(false);
      navigate("/trip");
    }
    onClose();
  };

  return (
    <div
      className={`${modalLayOut.modalOverlay} ${
        isOpen
          ? modalLayOut.modalOverlay_enter_active
          : modalLayOut.modalOverlay_exit_active
      }`}
      onMouseDown={handleOverlayClick}
    >
      <div
        className={`${modalLayOut.modal_bottom} ${
          isOpen
            ? modalLayOut.modal_bottom_enter_active
            : modalLayOut.modal_bottom_exit_active
        }`}
      >
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>이용약관동의</h1>
          <div className={styles.commonX}>
            <img
              src={commonX}
              alt="닫기"
              onClick={onClose}
              style={{ cursor: "pointer" }}
            />
          </div>
        </div>
        <div className={styles.contentContainer}>
          <p className={styles.description}>
            - 비행기 출발시간으로부터 24시간 이내에 가입을 완료하신 경우에만
            보장이 가능합니다.
          </p>
          <p className={styles.description}>
            - 가입 완료 전 발생한 사고에 대해서는 보장하지 않습니다.
          </p>
        </div>
        <div className={styles.optionsList}>
          {options.map((option, index) => (
            <li
              key={index}
              onClick={() => handleOptionClick(option)}
              style={{ cursor: "pointer" }}
            >
              {option.trim()}
            </li>
          ))}
        </div>
      </div>
    </div>
  );
};

export default IndemnityAgree;
