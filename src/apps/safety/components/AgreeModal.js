import React from "react";
import { useNavigate } from "react-router-dom";
import overLay from "../../../css/common/modalLayOut.module.css";
import styles from "../../../css/disasterSafeguard/address.module.css";
import rightArrow from "../../../assets/commonRightArrow.svg";

function AgreeModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  // 모달이 열려있지 않으면 아무것도 렌더링하지 않음
  if (!isOpen) {
    return null;
  }

  // 동의 버튼 클릭 시 처리 함수
  const handleAgreeClick = () => {
    onClose(); // 모달 닫기
    navigate("/addressSearch"); // 주소 검색 페이지로 이동
  };

  return (
    <>
      <div className={overLay.modalOverlay} onClick={onClose}>
        <div
          className={overLay.modal_bottom}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.modalContainer}>
            <h2>보험료 조회에 필요한 동의</h2>
            <p className={styles.mmdalSubTitle}>
              인슈어트러스트는 영업 전화를 걸지 않으니 안심하세요!
            </p>
            <ul>
              {/* Grid 방식을 적용한 li 요소 */}
              <li className={styles.modalGrid} onClick={() => navigate("/collectAgree")}>
                <p>필수 개인정보 수집·이용 동의</p>
                <img src={rightArrow} alt="rightArrow" />
              </li>
              <li className={styles.modalGrid} onClick={() => navigate("/provideAgree")}>
                <p>필수 개인정보 제3자 제공동의</p>
                <img src={rightArrow} alt="rightArrow" />
              </li>
            </ul>
          </div>
          <div className={styles.buttonContents}>
            <button className={styles.nextBtn} onClick={handleAgreeClick}>
              다음으로
            </button>
            <button className={styles.exitBtn} onClick={onClose}>
              다음에 할게요
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default AgreeModal;
