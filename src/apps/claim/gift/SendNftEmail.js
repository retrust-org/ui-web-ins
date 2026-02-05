import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../../../css/claim/sendModal.module.css";
import CustomInput from "../../../components/inputs/CustomInput";
import SuccessModal from "../../../components/modals/SuccessModal";
import ErrorModal from "../../../components/modals/ErrorModal";
import { SpotLoading } from "../../../components/loadings/SpotLoading";
import DisclaimerModal from "../../../components/modals/DisclaimerModal";

function SendNftEmail({ onClose, cardId }) {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [text, setText] = useState("");
  const [error, setError] = useState({
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showDisclaimerModal, setShowDisclaimerModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const maxLength = 80;

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const isFormValid = () => {
    return validateEmail(email) && text.trim().length > 0;
  };

  const handleConfirm = () => {
    if (!isFormValid()) return;
    setShowDisclaimerModal(true);
  };

  const handleActualConfirm = async () => {
    setLoading(true);

    try {
      // 민팅 API 호출
      const mintResponse = await fetch("/member-api/card/mintSouvenir", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ card_id: cardId, message: text }),
      });
      const mintData = await mintResponse.json();

      if (!mintData?.card?.card?.card_id) {
        throw new Error("민팅 결과에 필요한 데이터가 없습니다.");
      }

      // Escrow 생성 API 호출
      const escrowResponse = await fetch(
        `/card-api/card/${mintData.card.card.card_id}/escrow`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            delivery_method: "email",
            sender_name: mintData.sender,
            recipient_email: email,
            recipient_name: "SOUVENIR",
          }),
        }
      );
      const escrowData = await escrowResponse.json();

      // 배송 API 호출
      const deliveryResponse = await fetch("/member-api/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escrow_url: escrowData?.escrow.link_url,
          method: "email",
          sender: mintData.sender,
          email: email,
        }),
      });
      const deliveryResult = await deliveryResponse.json();

      if (deliveryResult.message === "Success") {
        setShowSuccessModal(true);
      } else {
        throw new Error("NFT 전송 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("Error:", error);
      setErrorMessage(error.message || "처리 중 오류가 발생했습니다.");
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    onClose();
    navigate("/claimReferral");
  };
  return (
    <div className={styles.container}>
      <div className={styles.title}>
        <h2>이메일로 발송하기</h2>
      </div>
      <p>이메일의 경우 메일로 링크가 전송됩니다.</p>
      <p>해당 메세지는 공개되는 메시지입니다.</p>
      <div className={styles.contentBox}>
        <div className={styles.inputWraps}>
          <label>받는 사람의 이메일</label>
          <CustomInput
            placeholder="받으실 분의 이메일을 입력해주세요."
            value={email}
            error={error.email}
            onChange={(value) => {
              setEmail(value);
              setError({ ...error, email: "" });
            }}
            type="email"
            onClear={() => {
              setEmail("");
            }}
          />
          {error.email && <p className={styles.errorText}>{error.email}</p>}
        </div>
        <div className={styles.inputWraps}>
          <label>마음을 담은 메세지를 전해보세요!</label>
          <div className={styles.textAreaWrap}>
            <textarea
              spellCheck="false"
              className={styles.customTextarea}
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="세상에 하나뿐인 여행 기념품이야, 소중히 간직해줘."
            />
            <div className={styles.textCount}>
              <div className={styles.currentCount}>{text.length}</div>
              <div className={styles.slash}>/</div>
              <div className={styles.quotientCount}>{maxLength}</div>
            </div>
          </div>
        </div>
      </div>
      <div className={styles.buttonWrap}>
        <button onClick={onClose} className={styles.changeMethod}>
          다른 방법 선택
        </button>
        <button
          className={styles.button}
          onClick={handleConfirm}
          disabled={!isFormValid()}
        >
          보내기
        </button>
      </div>
      {loading && <SpotLoading />}
      {showSuccessModal && (
        <SuccessModal
          message="NFT 엽서 보내기를"
          onClose={handleSuccessClose}
        />
      )}
      {showErrorModal && (
        <ErrorModal
          message={errorMessage}
          onClose={() => setShowErrorModal(false)}
        />
      )}
      {showDisclaimerModal && (
        <DisclaimerModal
          onConfirm={() => {
            setShowDisclaimerModal(false);
            handleActualConfirm();
          }}
          onCancel={() => setShowDisclaimerModal(false)}
          message="주의: 작성하신 메시지는 공개됩니다."
          subMsg="민감한 정보를 작성했는지 확인해주세요. 작성하신 메시지가 타인에게 노출될 수 있습니다."
        />
      )}
    </div>
  );
}

export default SendNftEmail;
