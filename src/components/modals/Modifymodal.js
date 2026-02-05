import styles from "../../css/trip/modifyModal.module.css";
import { useNavigate } from "react-router-dom";
import commonX from "../../assets/commonX.svg";

function ModifyModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const appType = process.env.REACT_APP_TYPE;
  const isDomestic = appType === "DOMESTIC";

  return (
    isOpen && (
      <div className={styles.modal}>
        <div className={styles.modalContent}>
          <div className={styles.modalContentWrap}>
            <div className={styles.modalContentWrap_Title}>
              <h3>변경 메뉴를 선택해주세요.</h3>
              <img src={commonX} alt="닫기" onClick={onClose} />
            </div>
            <div className={styles.redirectBtnContents}>
              <ul>
                <li
                  onClick={() => {
                    navigate("/insert");
                  }}
                >
                  <p>일정변경 및 사용자 정보 변경</p>
                </li>
                {!isDomestic && (
                  <li
                    onClick={() => {
                      navigate("/trip");
                    }}
                  >
                    <p>여행지 변경</p>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    )
  );
}

export default ModifyModal;
