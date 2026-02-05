/**
 * 풍수해 API 에러 체크 유틸
 * @param {Object} data - API 응답 데이터 (errCd, errMsg 포함)
 * @param {Function} setErrorModal - 에러 모달 상태 setter
 * @returns {boolean} 정상이면 true, 에러면 false
 */
export const checkApiError = (data, setErrorModal) => {
  if (data?.errCd && data.errCd !== "00001") {
    setErrorModal({
      isOpen: true,
      message: data.errMsg || "문제가 발생하여 가입이 불가능해요",
      subMsg: "고객센터에 문의해주세요.",
      errCd: data.errCd
    });
    return false;
  }
  return true;
};
