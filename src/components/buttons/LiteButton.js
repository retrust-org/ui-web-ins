import React from "react";
import { useSelector } from "react-redux";
import styles from "../../css/common/button.module.css";
import doubleChk from "../../assets/doubleChk.svg";
import plus from "../../assets/plus.svg";
import { PLAN_TYPES } from "../../data/ConfirmPlanData";

// LiteButton 컴포넌트 수정 (Button 컴포넌트 내부에 있을 것입니다)
const LiteButton = ({ showLiteButton, handleShowLite, isIndemnityPath }) => {
  const selectedData = useSelector((state) => state.plan.selectedData);
  const appType = process.env.REACT_APP_TYPE || "";

  // DOMESTIC 앱 타입 확인
  const isDomesticApp = appType === "DOMESTIC";

  // 버튼 표시 여부 확인 - 모든 앱 타입에서 버튼은 표시되지만 내용이 달라짐
  if (!isIndemnityPath || !showLiteButton) {
    return null;
  }

  // 앱 타입에 따라 다른 내용의 버튼 표시
  return (
    <div
      className={`${styles.liteButton} ${
        selectedData?.name ===
        (isDomesticApp ? PLAN_TYPES.ACTIVITY : PLAN_TYPES.LITE)
          ? styles.selected
          : ""
      }`}
      onClick={handleShowLite}
    >
      <img
        src={isDomesticApp ? plus : doubleChk}
        alt={isDomesticApp ? "plus" : "doubleChk"}
        style={isDomesticApp ? { margin: "0 auto", display: "block" } : {}}
      />
      <p>
        {isDomesticApp
          ? " 레저특약 추가 (골프,등산,마라톤,서바이벌 등)"
          : "최소한의 담보/보장 초실속 플랜을 원하신다면?"}
      </p>
    </div>
  );
};

export default LiteButton;
