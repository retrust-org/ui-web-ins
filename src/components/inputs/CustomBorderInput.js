import React, { useState, useEffect, useRef } from "react";
import styles from "../../css/common/customInput.module.css";
import { InputDeleteSVG } from "../svgIcons/RestFinishSVG";

const CustomBorderInput = ({
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
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef(null);
  const appType = process.env.REACT_APP_TYPE || "";

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

  const appTypeClass = appType === "DEPARTED" ? styles.departed : "";
  const errorClass = error ? styles.error : "";
  const focusedClass = isFocused ? styles.focused : "";
  const containerStyle = width ? { width } : {};

  return (
    <>
      <div
        className={`${styles.borderedInputBox} ${
          readOnly ? styles.readOnly : ""
        } ${appTypeClass} ${focusedClass} ${errorClass}`}
        style={containerStyle}
      >
        <input
          ref={inputRef}
          className={styles.borderedInput}
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
        {onClear && placeholder !== "앞자리" && value && (
          <InputDeleteSVG onClick={valueDeleteClick} />
        )}
      </div>
      {error && <p className={styles.errorMessage}>{error}</p>}
    </>
  );
};

export default CustomBorderInput;
