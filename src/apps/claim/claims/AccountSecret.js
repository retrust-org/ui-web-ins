import React, { useState } from "react";
import CreatePostData from "../../api/CreatePostData";
import usePublicKey from "../../api/PublicGetApi";
import Loading from "../../components/modal/Loading";
import styles from "../css/Comnons/secureKeyboard.module.css";
import cancel from "../../assets/commonX.svg";
import ClaimButton from "../common/ClaimButton";

const SecureKeyboard = ({ onChange, value }) => {
  const [inputValue, setInputValue] = useState("");
  const [maskedValue, setMaskedValue] = useState("");
  const [keyboardActive, setKeyboardActive] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleKeyPress = (value) => {
    if (/^\d*$/.test(value)) {
      setInputValue((prevValue) => {
        const newValue = prevValue + value;
        let mask = newValue;
        if (newValue.length < 7) {
          mask = "*".repeat(newValue.length - 1) + newValue.slice(-1); // 이전 값은 마스킹, 마지막 값은 그대로
        } else {
          mask = "*".repeat(newValue.length); // 전체 마스킹
        }
        setMaskedValue(mask);
        onChange(newValue); // 값 변경을 부모 컴포넌트로 전달
        return newValue;
      });
    }
  };

  const handleDelete = () => {
    setInputValue((prevValue) => {
      const newValue = prevValue.slice(0, -1);
      let mask = newValue;
      if (newValue.length < 7) {
        mask = "*".repeat(newValue.length - 1) + newValue.slice(-1); // 이전 값은 마스킹, 마지막 값은 그대로
      } else {
        mask = "*".repeat(newValue.length); // 전체 마스킹
      }
      setMaskedValue(mask);
      onChange(newValue); // 값 변경을 부모 컴포넌트로 전달
      return newValue;
    });
  };

  const handleDeleteAll = () => {
    setInputValue("");
    setMaskedValue("");
    onChange(""); // 값 변경을 부모 컴포넌트로 전달
  };

  const toggleKeyboard = () => {
    setKeyboardActive(!keyboardActive);

    // 키패드가 켜질 때 초기화
    if (!keyboardActive) {
      setInputValue("");
      setMaskedValue("");
    }
  };

  const handleConfirm = () => {
    onChange(inputValue); // 변경된 값을 부모 컴포넌트로 전달
    toggleKeyboard(); // 키보드 닫기
  };

  return (
    <div>
      <div onClick={toggleKeyboard}>
        <input
          type="text"
          value={maskedValue}
          maxLength={7}
          readOnly
          className={styles.customInput}
        />
      </div>
      {keyboardActive && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalContentWrap}>
                <span className={styles.modalTitle}>
                  주민번호 뒷자리를 입력해주세요.
                </span>
                <img src={cancel} alt="cancel" onClick={toggleKeyboard} />
              </div>
              <div className={styles.progressBar}>
                {[...Array(7)].map((_, index) => (
                  <div
                    key={index}
                    className={`${styles.progressDot} ${
                      inputValue.length > index ? styles.activeDot : ""
                    }`}
                  ></div>
                ))}
              </div>
              {error && (
                <p style={{ color: "#E86565", marginTop: "8px" }}>{error}</p>
              )}
            </div>
            <div className={styles.keyboard}>
              {[...Array(10).keys()].map((number, index) => (
                <div
                  key={index}
                  className={styles.keyboardKey}
                  onClick={() => handleKeyPress(number.toString())}
                >
                  {number}
                </div>
              ))}
              <div className={styles.keyboardKey} onClick={handleDelete}>
                삭제
              </div>
              <div className={styles.keyboardKey} onClick={handleDeleteAll}>
                전체삭제
              </div>
            </div>
            <div className={styles.modalActions}>
              <button className={styles.closeButton} onClick={handleConfirm}>
                확인
              </button>
            </div>
          </div>
        </div>
      )}
      {loading && <Loading />} {/* 로딩 중일 때만 로딩 컴포넌트 표시 */}
    </div>
  );
};

function AccountSecret({ onClick, disabled }) {
  const publicKey = usePublicKey();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleEncryption = async () => {
    if (loading) return; // Prevent duplicate requests

    try {
      setLoading(true);

      if (!publicKey) {
        setLoading(false);
        setError("유효하지 않는 접근입니다.");
        return;
      }

      const encryptedData = await CreatePostData("", publicKey);
      onClick(encryptedData);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <SecureKeyboard onChange={() => {}} value="" />{" "}
      <ClaimButton
        buttonText="다음"
        onClick={handleEncryption}
        disabled={disabled}
      />
      {loading && <Loading />}
      {error && <div className={styles.error}>{error}</div>}
    </div>
  );
}

export default AccountSecret;
