import { useState, useEffect } from "react";

/**
 * sessionStorage를 통해 복원된 Context 데이터를 로컬 state로 자동 동기화하는 훅
 *
 * @param {any} contextValue - Context에서 가져온 값 (sessionStorage에서 복원된 값)
 * @param {any} initialValue - 초기값 (contextValue가 없을 때 사용)
 * @returns {Array} [state, setState] - useState와 동일한 형태
 *
 * @example
 * const { businessData } = useDisasterInsurance();
 * const [companyName, setCompanyName] = useSessionState(businessData.companyName, "");
 */
export const useSessionState = (contextValue, initialValue) => {
  const [state, setState] = useState(contextValue || initialValue);

  // Context 값이 변경되면 (sessionStorage에서 복원되면) state 업데이트
  useEffect(() => {
    if (contextValue !== undefined && contextValue !== null && contextValue !== "") {
      setState(contextValue);
    }
  }, [contextValue]);

  return [state, setState];
};
