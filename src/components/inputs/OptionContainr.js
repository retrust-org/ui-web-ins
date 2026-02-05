import React, { useState } from "react";
import styles from "../../css/common/optionContainr.module.css";
import downChk from "../../assets/commonDownArrow.svg";

function OptionContainer({
  title,
  items = [],
  onChange,
  onItemSelect,
  disabled = false,
}) {
  const [isActive, setIsActive] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const handleClick = () => {
    // disabled가 true이면 클릭 이벤트 무시
    if (disabled) return;

    const newActiveState = !isActive;
    setIsActive(newActiveState);

    // 부모 컴포넌트에 상태 변경을 알림
    if (onChange) {
      onChange(newActiveState);
    }

    // 비활성화될 때 선택된 항목 초기화
    if (!newActiveState && !selectedItem) {
      setSelectedItem(null);
    }
  };

  const handleItemClick = (item) => {
    // disabled가 true이면 클릭 이벤트 무시
    if (disabled) return;

    setSelectedItem(item);
    setIsActive(false); // 항목 선택 후 드롭다운 닫기

    // 항목 선택 시 부모 컴포넌트에 알림
    if (onItemSelect) {
      onItemSelect(item);
    }
  };

  // 활성화 상태일 때만 expanded 클래스 추가 (값이 있는지 여부와 무관하게)
  const isExpanded = isActive;

  return (
    <div className={styles.optionContainerWrapper}>
      <div
        className={`${styles.checkContainer} ${
          isExpanded ? styles.expanded : ""
        } ${disabled ? styles.disabled : ""}`}
      >
        <div
          className={`${styles.checkBox} ${isActive ? styles.active : ""} ${
            isActive ? styles.expanded : ""
          } ${disabled ? styles.disabled : ""}`}
          onClick={handleClick}
        >
          {/* 선택된 항목이 있으면 표시, 없으면 title 표시 */}
          <p className={selectedItem ? styles.selected : styles.notSelected}>
            {selectedItem || title}
          </p>
          {!disabled && (
            <img
              src={downChk}
              alt="Chk"
              className={isActive ? styles.rotateIcon : ""}
            />
          )}
        </div>

        {/* disabled일 때는 드롭다운 메뉴 표시 안 함 */}
        {!disabled && (
          <div
            className={`${styles.detailContainer} ${
              isActive ? styles.active : ""
            }`}
          >
            {items.map((item, index) => (
              <div
                key={index}
                className={`${styles.detailItem} ${
                  selectedItem === item ? styles.selectedItem : ""
                }`}
                onClick={() => handleItemClick(item)}
              >
                {item}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OptionContainer;
