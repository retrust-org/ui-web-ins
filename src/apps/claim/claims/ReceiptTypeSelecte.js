import { useNavigate } from "react-router-dom";
import BaseModalBottom from "../../../components/layout/BaseModalBottom";
import styles from "../../../css/claim/receiptTypeSelecte.module.css";
import { useClaimUploadContext } from "../../../context/ClaimUploadContext";

function ReceiptTypeSelecte({ onClose }) {
  const options = ["본인청구", "미성년 자녀 청구"];
  const navigate = useNavigate();
  const { setSelectedReceiptType, resetInsuredAndAcceptData } =
    useClaimUploadContext();

  // 한글 타입을 영어 타입으로 변환하는 함수
  const convertToEnglishType = (koreanType) => {
    switch (koreanType) {
      case "본인청구":
        return "self";
      case "미성년 자녀 청구":
        return "minorChild";
      default:
        return "self"; // 기본값
    }
  };

  const typeSelect = (type) => {
    // 이전 접수 유형 관련 데이터 초기화
    resetInsuredAndAcceptData();

    // 한글 타입을 영어로 변환해서 Context에 저장
    const englishType = convertToEnglishType(type);
    setSelectedReceiptType(englishType); 

    // 타입에 따라 다른 페이지로 이동
    if (type === "미성년 자녀 청구") {
      navigate("/receptioninfo");
    } else {
      navigate("/insuredpeopleInfo");
    }

    onClose();
  };

  return (
    <BaseModalBottom onClose={onClose}>
      <div className={styles.receiptContainer}>
        <section className={styles.receiptSection}>
          <h2>접수유형을 선택해주세요</h2>
          <div className={styles.selectOption}>
            {options.map((ele, i) => (
              <p key={i} onClick={() => typeSelect(ele)}>
                {ele}
              </p>
            ))}
          </div>
        </section>
      </div>
    </BaseModalBottom>
  );
}

export default ReceiptTypeSelecte;
