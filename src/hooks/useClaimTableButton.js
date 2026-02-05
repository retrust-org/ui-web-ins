// hooks/useClaimTableButton.js
import { useContext } from "react";
import ClaimTableButtonContext from "../context/ClaimsNavigateContext";

// 커스텀 훅 - 텍스트 관련 로직 삭제
const useClaimTableButton = () => {
  const context = useContext(ClaimTableButtonContext);
  if (context === undefined) {
    throw new Error("청구 테이블 버튼 컨텍스트 오류");
  }
  return context;
};

export default useClaimTableButton;
