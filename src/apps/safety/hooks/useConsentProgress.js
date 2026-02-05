import { useState } from 'react';

/**
 * 약관 동의 페이지의 진행 상태 및 스크롤 기능을 관리하는 Hook
 *
 * @param {number} totalItems - 총 동의 항목 개수 (기본값: 9)
 * @returns {Object} - clickCount, handleButtonClick, buttonText, isLastStep
 */
function useConsentProgress(totalItems = 9) {
  const [clickCount, setClickCount] = useState(0);

  /**
   * 버튼 클릭 핸들러
   * - 0~8번 클릭: 해당 consent-item으로 스크롤
   * - 9번 클릭: consentStates 확인 후 onComplete 콜백 실행 (navigate)
   *
   * @param {Array} consentStates - 동의 상태 배열 (모든 항목이 1이어야 navigate)
   * @param {Function} onComplete - 모든 항목 확인 후 실행할 콜백 (navigate 등)
   */
  const handleButtonClick = (consentStates, onComplete) => {
    if (clickCount < totalItems) {
      // 현재 클릭 횟수에 해당하는 항목으로 스크롤 (증가 전 값 사용)
      const element = document.getElementById(`consent-item-${clickCount}`);
      if (element) {
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
      // 스크롤 후 clickCount 증가
      setClickCount(prev => prev + 1);
    } else {
      // 모든 항목 스크롤 완료 후: 동의 상태 확인
      const allAgreed = consentStates.every(state => state === 1);

      if (allAgreed && onComplete) {
        // 모두 동의했을 때만 navigate
        onComplete();
      } else {
        // 동의하지 않은 항목이 있으면 경고
        alert('모든 항목에 동의해주세요.');
      }
    }
  };

  // 버튼 텍스트 동적 계산
  const buttonText = clickCount < totalItems ? "동의하기" : "다음 약관 보러가기";

  // 마지막 단계 여부
  const isLastStep = clickCount >= totalItems;

  return {
    clickCount,
    handleButtonClick,
    buttonText,
    isLastStep
  };
}

export default useConsentProgress;
