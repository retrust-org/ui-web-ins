import React, { useState, useEffect } from "react";
import styles from "../../css/common/rangeInput.module.css";

function RangeInput({ activeFilter, maxValue = 5000, minValue = 500, value: externalValue, onChange, onManualChange }) {
  const minValueInWon = minValue * 10000; // 만원 단위를 원 단위로 변환
  const [internalValue, setInternalValue] = useState(minValueInWon);

  // 제어/비제어 컴포넌트 모두 지원: externalValue가 있으면 사용, 없으면 internalValue 사용
  const value = externalValue !== undefined ? externalValue : internalValue;

  // externalValue 변경 시 내부 state 동기화 (제어 컴포넌트 모드)
  useEffect(() => {
    if (externalValue !== undefined) {
      setInternalValue(externalValue);
    }
  }, [externalValue]);

  // activeFilter 변경 시 초기값 설정
  useEffect(() => {
    let initialValue = minValueInWon;

    switch (activeFilter) {
      case "추천":
        initialValue = Math.min(20000000, maxValue * 10000); // 2천만원 = 20000000원
        break;
      case "럭셔리":
        initialValue = Math.min(30000000, maxValue * 10000); // 3천만원 = 30000000원
        break;
      case "직접선택":
      default:
        // 직접선택으로 변경 시 현재 값 유지 (사용자가 조절한 값 보존)
        return;
    }

    setInternalValue(initialValue);
    // activeFilter 변경 시에도 부모에게 값 전달 (자동 변경)
    if (onChange) {
      onChange(initialValue);
    }
  }, [activeFilter, maxValue, minValueInWon]);

  const handleChange = (e) => {
    const newValue = Number(e.target.value);
    // 비제어 컴포넌트 모드일 때만 내부 state 업데이트
    if (externalValue === undefined) {
      setInternalValue(newValue);
    }
    // 사용자가 수동으로 조절한 경우 onManualChange 호출
    if (onManualChange) {
      onManualChange(newValue);
    }
  };

  const calculateProgress = (currentValue) => {
    const range = (maxValue * 10000) - minValueInWon;
    return ((currentValue - minValueInWon) / range) * 100;
  };

  // 원 단위를 만원 단위로 변환하여 표시 (5000000 → 500)
  const formatValueForDisplay = (valueInWon) => {
    return valueInWon / 10000; // 만원 단위로 표시
  };

  return (
    <div className={styles.sliderContainer}>
      <div className={styles.inputValue}>
        <p>{formatValueForDisplay(value)}</p>
        <span>만원</span>
      </div>
      <input
        type="range"
        value={value}
        onChange={handleChange}
        className={styles.slider}
        style={{ "--range-progress": `${calculateProgress(value)}%` }}
        aria-label="Price Slider"
        min={minValueInWon}
        max={maxValue * 10000}
        step={5000000}
      />
    </div>
  );
}

export default RangeInput;
