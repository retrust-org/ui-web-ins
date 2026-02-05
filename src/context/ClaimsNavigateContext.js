import React, { createContext, useState } from "react";

// Context 생성
const ClaimTableButtonContext = createContext();

// Provider 컴포넌트
export const ClaimTableButtonProvider = ({ children }) => {
  // 네비게이션 경로 상태만 유지
  const [tableBtnPath, setTableBtnPath] = useState("");
  const [contextBtnName, setContextBtnName] = useState("");

  // Provider 값
  const value = {
    tableBtnPath,
    setTableBtnPath,
    setContextBtnName,
    contextBtnName,
  };

  return (
    <ClaimTableButtonContext.Provider value={value}>
      {children}
    </ClaimTableButtonContext.Provider>
  );
};

export default ClaimTableButtonContext;
