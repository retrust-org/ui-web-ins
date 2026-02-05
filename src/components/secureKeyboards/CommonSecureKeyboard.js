import React, { useState, useEffect } from "react";
import CustomBorderInput from "../inputs/CustomBorderInput";
import styles from "../../css/common/secureKeyboard.module.css";
import commonX from "../../assets/commonX.svg";

const CommonSecureKeyboard = ({
  value,
  onChange,
  maxLength,
  placeholder,
  onConfirm,
  maskValue,
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [keyboardActive, setKeyboardActive] = useState(false);

  // value prop이 변경될 때 inputValue 동기화
  useEffect(() => {
    setInputValue(value || '');
  }, [value]);

  const handleKeyPress = (keyValue) => {
    // maxLength 체크
    if (maxLength && inputValue.length >= maxLength) {
      return;
    }

    const newValue = inputValue + keyValue;
    setInputValue(newValue);
    // onChange 제거 - 확인 버튼을 눌렀을 때만 저장
  };

  const handleDelete = () => {
    const newValue = inputValue.slice(0, -1);
    setInputValue(newValue);
    // onChange 제거 - 확인 버튼을 눌렀을 때만 저장
  };

  const handleDeleteAll = () => {
    setInputValue("");
    // onChange 제거 - 확인 버튼을 눌렀을 때만 저장
  };

  const toggleKeyboard = () => {
    setKeyboardActive(!keyboardActive);
  };

  const handleConfirm = () => {
    onConfirm(inputValue);
    toggleKeyboard();
  };

  const handleClose = () => {
    setInputValue(value || ''); // 원래 값으로 초기화 (임시 입력값 버림)
    toggleKeyboard();
  };

  const updateMaskedValue = (val) => {
    if (val.length === 0) {
      return "";
    } else if (val.length <= 7) {
      return "*".repeat(val.length - 1) + val.slice(-1);
    } else {
      return "*".repeat(6) + val.slice(-1); // 최대 7자리까지만 허용
    }
  };

  const accountMaskValue = (value) => {
    if (!value) return "";

    let visiblePart = value.slice(0, 3); // 처음 3글자는 그대로 보여줌
    let maskedPart = "";

    // 마스킹 처리
    for (let i = 3; i < Math.min(value.length, 7); i++) {
      maskedPart += "*";
    }

    // 입력값의 길이가 8글자 이상이면 나머지 부분을 그대로 붙임
    if (value.length > 7) {
      maskedPart += value.slice(7);
    }

    return visiblePart + maskedPart;
  };

  const accountSecretMaskValue = (value) => {
    if (!value) return "";

    // 입력값을 13자리로 제한
    const limitedValue = value.slice(0, 13);

    let maskedValue = "";
    for (let i = 0; i < limitedValue.length; i++) {
      if (i < 6) {
        maskedValue += limitedValue[i]; // 처음 6글자는 그대로 보여줌
      } else if (i === limitedValue.length - 1) {
        maskedValue += limitedValue[i]; // 현재 입력한 마지막 숫자는 보여줌
      } else {
        maskedValue += "*"; // 7번째부터 마지막 전까지는 *로 마스킹
      }
    }

    return maskedValue;
  };

  // 미성년 자녀용 마스킹 함수 추가
  const minorChildMaskValue = (value) => {
    if (!value) return "";

    // 13자리로 제한
    const limitedValue = value.slice(0, 13);

    // 마지막 입력한 숫자만 보여주고 나머지는 모두 마스킹
    if (limitedValue.length === 0) {
      return "";
    } else if (limitedValue.length === 1) {
      return limitedValue; // 첫 번째 숫자는 그대로 보여줌
    } else {
      return "*".repeat(limitedValue.length - 1) + limitedValue.slice(-1);
    }
  };

  const getMaskedValue = (value) => {
    // 값이 없으면 빈 문자열 반환 (placeholder 표시를 위해)
    if (!value || value.length === 0) {
      return '';
    }

    if (maskValue === "secret") {
      return updateMaskedValue(value);
    } else if (maskValue === "account") {
      return accountMaskValue(value);
    } else if (maskValue === "accountSecret") {
      return accountSecretMaskValue(value);
    } else if (maskValue === "minorChild") {
      return minorChildMaskValue(value);
    }
    return value;
  };

  return (
    <div>
      <div onClick={toggleKeyboard}>
        <CustomBorderInput
          type="text"
          value={getMaskedValue(inputValue)} // 마스킹된 값으로 표시
          maxLength={maxLength}
          readOnly
          placeholder={placeholder}
          className={styles.customInput}
        />
      </div>
      {keyboardActive && (
        <div className={styles.overlay}>
          <div className={styles.modals}>
            <div className={styles.modalContents}>
              <div className={styles.modalContentWrap}>
                <span className={styles.modalTitles}>정보를 입력해주세요.</span>
                <img src={commonX} alt="닫기" onClick={handleClose} />
              </div>
              <div className={styles.inputWrap}>
                <CustomBorderInput
                  value={getMaskedValue(inputValue)} // 마스킹된 값으로 표시
                  maxLength={maxLength}
                  onChange={(e) => {
                    setInputValue(e.target.value); // 입력 값 업데이트
                    onChange(e.target.value); // 부모 컴포넌트에도 업데이트 전달
                  }}
                  readOnly
                  placeholder={placeholder}
                  className={styles.customInput}
                />
              </div>
              <div className={styles.keyboard}>
                {[...Array(10).keys()].map((number) => (
                  <div
                    key={number}
                    className={styles.keyboardKeys}
                    onClick={() => handleKeyPress(number.toString())}
                  >
                    {number}
                  </div>
                ))}
                <div className={styles.keyboardKeys} onClick={handleDelete}>
                  삭제
                </div>
                <div className={styles.keyboardKeys} onClick={handleDeleteAll}>
                  전체삭제
                </div>
              </div>
              <div className={styles.modalActions}>
                <button
                  className={`${styles.closeButtons} ${
                    !inputValue.trim() ? styles.disabled : ""
                  }`}
                  onClick={handleConfirm}
                  disabled={!inputValue.trim()}
                >
                  확인
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CommonSecureKeyboard;
