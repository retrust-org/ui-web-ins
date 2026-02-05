import React, { useState, useEffect, useRef } from "react";
import styles from "../../css/common/customInput.module.css";
import { InputDeleteSVG } from "../svgIcons/RestFinishSVG";
import commonCheck from '../../assets/commonCheck.svg'
import commonActiveChk from '../../assets/commonActiveChk.svg'

const CustomInput = ({
  width,
  placeholder,
  type,
  maxLength,
  value,
  onChange,
  error,
  onClear,
  isErrorFocused,
  readOnly,
  onClick,
  showForeignerCheck = false, // 외국인 체크박스 표시 여부
  isForeignerChecked = false, // 외국인 체크 상태
  onForeignerCheck, // 외국인 체크박스 클릭 핸들러
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const appType = process.env.REACT_APP_TYPE || "";

  // 앱 타입에 따른 포커스 색상 설정
  const focusColor = appType === "DEPARTED" ? "#0e98f6" : "#386937";

  useEffect(() => {
    if (isErrorFocused && error && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isErrorFocused, error]);

  const handleInputChange = (e) => {
    const inputValue = e.target.value;
    if (onChange) {
      onChange(inputValue);
    }
  };

  const valueDeleteClick = () => {
    if (onClear) {
      onClear();
    }
  };

  const handleForeignerCheckClick = () => {
    if (onForeignerCheck) {
      onForeignerCheck(!isForeignerChecked);
    }
  };

  const containerStyle = {
    width: width ? width : "100% ",
    border: isFocused
      ? `2px solid ${focusColor}`
      : error
        ? "2px solid #E86565"
        : "2px solid transparent",
  };

  const handleFocus = () => {
    if (readOnly) {
      inputRef.current.blur();
    } else {
      setIsFocused(true);
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  return (
    <div
      className={`${styles.styledInputBox} ${readOnly ? styles.readOnly : ""}`}
      style={containerStyle}
    >
      <input
        ref={inputRef}
        className={styles.styledInput}
        type={type}
        value={value || ""}
        onChange={handleInputChange}
        maxLength={maxLength}
        placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        readOnly={readOnly}
        onClick={onClick}
      />

      {/* 국내여행일 때만 외국인 체크박스 표시 */}
      {showForeignerCheck && appType === "DOMESTIC" && (
        <div
          className={styles.foreignCheck}
          onClick={handleForeignerCheckClick}
        >
          <img
            src={isForeignerChecked ? commonActiveChk : commonCheck}
            alt="foreignChk"
          />
          <p className={styles.foreignText}>외국인</p>
        </div>
      )}

      {onClear && placeholder !== "앞자리" && value && (
        <InputDeleteSVG onClick={valueDeleteClick} />
      )}
    </div>
  );
};

export default CustomInput;