import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import commonX from "../../../assets/commonX.svg";
import commonCheck from "../../../assets/commonCheck.svg";
import AcitveCommonCheck from "../../../assets/commonActiveChk.svg";
import styles from "../../../css/claim/ClaimExtendModal.module.css";
import modalLayOut from "../../../css/common/modalLayOut.module.css";
import ClaimButton from "../../../components/buttons/ClaimButton";

function ClaimExtendModal({ filteredData, onClose, isOpen }) {
  const [selected, setSelected] = useState(1);
  const navigate = useNavigate();

  const options = ["예, 사고가 있었어요.", "아니오, 사고가 없었어요."];

  const handleNavigation = () => {
    if (selected === 0) {
      if (
        window.confirm(
          "사고가 있을 경우 도착일 변경이 불가능합니다. 이전페이지로 돌아가시겠습니까?"
        )
      ) {
        navigate("/ClaimExtendDate");
      }
    } else if (selected === 1) {
      if (filteredData) {
        navigate("/claimExtendSelectDate", { state: filteredData });
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className={modalLayOut.modalOverlay}>
      <div
        className={`${modalLayOut.modal_bottom} ${modalLayOut.modal_bottom_enter_active}`}
      >
        <div className={styles.headerContainer}>
          <h1 className={styles.title}>보험사고 발생여부를 알려주세요.</h1>
          <img
            src={commonX}
            alt="닫기"
            className={styles.closeButton}
            onClick={onClose}
          />
        </div>
        <div className={styles.contentContainer}>
          <p className={styles.description}>
            도착일 변경의 경우, 연장 신청일 기준으로 이전에 사고가 없을 경우만
            가능합니다.
          </p>
          <p>사고 사실을 통보하지 않고 연장한 경우 보험금 지급이 어렵습니다.</p>
        </div>
        <div className={styles.optionsContainer}>
          <ul className={styles.optionsList}>
            {options.map((text, idx) => (
              <li
                key={idx}
                className={`${styles.optionItem} ${
                  selected === idx
                    ? styles.selectedOption
                    : styles.unselectedOption
                }`}
                onClick={() => setSelected(idx)}
              >
                <img
                  src={selected === idx ? AcitveCommonCheck : commonCheck}
                  alt="체크"
                />
                <p className={styles.optionText}>{text}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.buttonContainer}>
          <ClaimButton buttonText="확인" onClick={handleNavigation} />
        </div>
      </div>
    </div>
  );
}

export default ClaimExtendModal;
