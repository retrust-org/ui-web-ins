import { useDispatch } from "react-redux";

const useClearAllData = () => {
  const dispatch = useDispatch();

  const clearAllData = () => {
    // Redux 상태 초기화
    const slicesToReset = [
      "purpose",
      "hasDeparted",
      "plan",
      "calendar",
      "user",
      "companions",
      "country",
      "totalPrice",
      "priceData",
      "insurance",
      "personalInfo",
      "userForm",
      "companionForm",
      "pdf",
    ];

    slicesToReset.forEach((sliceName) => {
      dispatch({ type: `${sliceName}/reset` });
    });

    // 세션스토리지 정리
    try {
      sessionStorage.removeItem("reduxState");
      sessionStorage.removeItem("calcExcel_userData");
      sessionStorage.removeItem("calcExcel_fileName");
      sessionStorage.removeItem("isDomesticExcelMode");
      sessionStorage.removeItem("isExcelMode");
      sessionStorage.removeItem("indemnityState");

      console.log("모든 데이터가 성공적으로 정리되었습니다.");
    } catch (error) {
      console.warn("세션스토리지 정리 중 오류 발생:", error);
    }
  };

  return { clearAllData };
};

export default useClearAllData;
