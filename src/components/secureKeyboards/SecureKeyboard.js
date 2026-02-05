import React, { useState, useEffect } from "react";
import CustomBorderInput from "../../components/inputs/CustomBorderInput";
import styles from "../../css/common/secureKeyboard.module.css";
import cancel from "../../assets/commonX.svg";

const SecureKeyboard = ({ onChange, value, placeholder }) => {
  const [inputValue, setInputValue] = useState(value || "");
  const [maskedValue, setMaskedValue] = useState("");
  const [keyboardActive, setKeyboardActive] = useState(false);

  useEffect(() => {
    setInputValue(value || "");
    updateMaskedValue(value || "");
  }, [value]);

  const updateMaskedValue = (val) => {
    if (val.length === 0) {
      setMaskedValue("");
    } else if (val.length <= 7) {
      setMaskedValue("*".repeat(val.length - 1) + val.slice(-1));
    } else {
      setMaskedValue("*".repeat(7) + val.slice(-1));
    }
  };

  const handleKeyPress = (value) => {
    if (/^\d*$/.test(value)) {
      const newValue = inputValue + value;
      const truncatedValue = newValue.slice(0, 7); // 최대 7자리까지만 유지
      updateMaskedValue(truncatedValue);
      setInputValue(truncatedValue);
    }
  };

  const handleDelete = () => {
    if (inputValue.length > 0) {
      const newValue = inputValue.slice(0, -1);
      updateMaskedValue(newValue);
      setInputValue(newValue);
    }
  };

  const handleDeleteAll = () => {
    setInputValue("");
    setMaskedValue("");
  };

  const toggleKeyboard = () => {
    setKeyboardActive(!keyboardActive);

    // 키보드를 토글할 때 입력값과 마스킹된 값을 초기화
    if (!keyboardActive) {
      setInputValue("");
      setMaskedValue("");
    }
  };

  const handleConfirm = () => {
    onChange(inputValue); // 변경된 값을 부모 컴포넌트로 전송
    toggleKeyboard(); // 키보드 닫기
  };

  return (
    <div>
      <div onClick={toggleKeyboard}>
        <CustomBorderInput
          type="text"
          value={maskedValue}
          placeholder="주민등록번호 뒷자리를 입력해주세요."
          maxLength={7} // 최대 7자리까지 보여줌
          readOnly
          className={styles.customInput}
        />
      </div>
      {keyboardActive && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <div className={styles.modalContent}>
              <div className={styles.modalContentWrap}>
                <span className={styles.modalTitle}>정보를 입력해주세요.</span>
                <img src={cancel} alt="cancel" onClick={toggleKeyboard} />
              </div>
              <div className={styles.progressBar}>
                <CustomBorderInput
                  type="text"
                  value={maskedValue}
                  placeholder="주민등록번호 뒷자리를 입력해주세요"
                  maxLength={7} // 최대 7자리까지 보여줌
                  readOnly
                />
              </div>
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
              <button
                className={styles.closeButton}
                onClick={handleConfirm}
                disabled={inputValue.length === 0}
                style={{ opacity: inputValue.length === 0 ? 0.5 : 1 }}
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SecureKeyboard;
