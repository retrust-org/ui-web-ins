/**
 * 키보드 네비게이션 유틸리티 함수들
 * 포커스 관리, 탭 순서, 키보드 이벤트 처리를 위한 헬퍼 함수들
 */

// 포커스 가능한 요소들의 선택자
const FOCUSABLE_ELEMENTS = [
  'a[href]',
  'button:not([disabled])',
  'textarea:not([disabled])',
  'input:not([disabled])',
  'select:not([disabled])',
  '[tabindex]:not([tabindex="-1"])',
  '[contenteditable="true"]'
].join(', ');

/**
 * 특정 요소 내에서 포커스 가능한 모든 요소를 찾습니다
 * @param {Element} container - 검색할 컨테이너 요소
 * @returns {Element[]} 포커스 가능한 요소들의 배열
 */
export const getFocusableElements = (container) => {
  if (!container) return [];

  const elements = container.querySelectorAll(FOCUSABLE_ELEMENTS);
  return Array.from(elements).filter(element => {
    return element.offsetParent !== null && // 요소가 보이는지 확인
           getComputedStyle(element).visibility !== 'hidden' &&
           !element.hasAttribute('aria-hidden');
  });
};

/**
 * 첫 번째 포커스 가능한 요소를 찾습니다
 * @param {Element} container - 검색할 컨테이너 요소
 * @returns {Element|null} 첫 번째 포커스 가능한 요소 또는 null
 */
export const getFirstFocusableElement = (container) => {
  const focusableElements = getFocusableElements(container);
  return focusableElements.length > 0 ? focusableElements[0] : null;
};

/**
 * 마지막 포커스 가능한 요소를 찾습니다
 * @param {Element} container - 검색할 컨테이너 요소
 * @returns {Element|null} 마지막 포커스 가능한 요소 또는 null
 */
export const getLastFocusableElement = (container) => {
  const focusableElements = getFocusableElements(container);
  return focusableElements.length > 0 ? focusableElements[focusableElements.length - 1] : null;
};

/**
 * 다음 포커스 가능한 요소를 찾습니다
 * @param {Element} currentElement - 현재 포커스된 요소
 * @param {Element} container - 검색할 컨테이너 요소
 * @returns {Element|null} 다음 포커스 가능한 요소 또는 null
 */
export const getNextFocusableElement = (currentElement, container) => {
  const focusableElements = getFocusableElements(container);
  const currentIndex = focusableElements.indexOf(currentElement);

  if (currentIndex === -1) return getFirstFocusableElement(container);

  const nextIndex = (currentIndex + 1) % focusableElements.length;
  return focusableElements[nextIndex];
};

/**
 * 이전 포커스 가능한 요소를 찾습니다
 * @param {Element} currentElement - 현재 포커스된 요소
 * @param {Element} container - 검색할 컨테이너 요소
 * @returns {Element|null} 이전 포커스 가능한 요소 또는 null
 */
export const getPreviousFocusableElement = (currentElement, container) => {
  const focusableElements = getFocusableElements(container);
  const currentIndex = focusableElements.indexOf(currentElement);

  if (currentIndex === -1) return getLastFocusableElement(container);

  const previousIndex = currentIndex === 0 ? focusableElements.length - 1 : currentIndex - 1;
  return focusableElements[previousIndex];
};

/**
 * 요소에 포커스를 설정합니다 (안전하게)
 * @param {Element} element - 포커스할 요소
 * @param {Object} options - 포커스 옵션
 * @param {boolean} options.preventScroll - 스크롤 방지 여부 (기본값: false)
 */
export const focusElement = (element, options = {}) => {
  if (!element || typeof element.focus !== 'function') return;

  try {
    element.focus(options);
  } catch (error) {
    console.warn('포커스 설정 실패:', error);
  }
};

/**
 * 키보드 이벤트가 특정 키인지 확인합니다
 * @param {KeyboardEvent} event - 키보드 이벤트
 * @param {string|string[]} keys - 확인할 키 또는 키 배열
 * @returns {boolean} 키가 일치하는지 여부
 */
export const isKey = (event, keys) => {
  const keyArray = Array.isArray(keys) ? keys : [keys];
  return keyArray.includes(event.key) || keyArray.includes(event.code);
};

/**
 * 탭 키 이벤트를 처리합니다 (포커스 트랩에 사용)
 * @param {KeyboardEvent} event - 키보드 이벤트
 * @param {Element} container - 포커스를 제한할 컨테이너
 * @returns {boolean} 이벤트가 처리되었는지 여부
 */
export const handleTabKey = (event, container) => {
  if (!isKey(event, 'Tab')) return false;

  const focusableElements = getFocusableElements(container);
  if (focusableElements.length === 0) return false;

  const firstElement = focusableElements[0];
  const lastElement = focusableElements[focusableElements.length - 1];

  if (event.shiftKey) {
    // Shift + Tab (이전 요소로)
    if (document.activeElement === firstElement) {
      event.preventDefault();
      focusElement(lastElement);
      return true;
    }
  } else {
    // Tab (다음 요소로)
    if (document.activeElement === lastElement) {
      event.preventDefault();
      focusElement(firstElement);
      return true;
    }
  }

  return false;
};

/**
 * 엔터 키나 스페이스 키로 클릭 이벤트를 시뮬레이트합니다
 * @param {KeyboardEvent} event - 키보드 이벤트
 * @param {Function} onClick - 클릭 핸들러 함수
 * @returns {boolean} 이벤트가 처리되었는지 여부
 */
export const handleActivationKeys = (event, onClick) => {
  if (isKey(event, ['Enter', 'Space', ' '])) {
    event.preventDefault();
    if (typeof onClick === 'function') {
      onClick(event);
    }
    return true;
  }
  return false;
};

/**
 * 화살표 키로 드롭다운 네비게이션을 처리합니다
 * @param {KeyboardEvent} event - 키보드 이벤트
 * @param {Element[]} options - 드롭다운 옵션 요소들
 * @param {number} currentIndex - 현재 선택된 인덱스
 * @param {Function} onIndexChange - 인덱스 변경 콜백
 * @returns {boolean} 이벤트가 처리되었는지 여부
 */
export const handleArrowKeys = (event, options, currentIndex, onIndexChange) => {
  if (!Array.isArray(options) || options.length === 0) return false;

  let newIndex = currentIndex;

  if (isKey(event, ['ArrowDown', 'ArrowRight'])) {
    event.preventDefault();
    newIndex = currentIndex < options.length - 1 ? currentIndex + 1 : 0;
  } else if (isKey(event, ['ArrowUp', 'ArrowLeft'])) {
    event.preventDefault();
    newIndex = currentIndex > 0 ? currentIndex - 1 : options.length - 1;
  } else if (isKey(event, 'Home')) {
    event.preventDefault();
    newIndex = 0;
  } else if (isKey(event, 'End')) {
    event.preventDefault();
    newIndex = options.length - 1;
  } else {
    return false;
  }

  if (newIndex !== currentIndex && typeof onIndexChange === 'function') {
    onIndexChange(newIndex);
    if (options[newIndex]) {
      focusElement(options[newIndex]);
    }
  }

  return true;
};

/**
 * ESC 키로 닫기 동작을 처리합니다
 * @param {KeyboardEvent} event - 키보드 이벤트
 * @param {Function} onClose - 닫기 콜백 함수
 * @returns {boolean} 이벤트가 처리되었는지 여부
 */
export const handleEscapeKey = (event, onClose) => {
  if (isKey(event, ['Escape', 'Esc'])) {
    event.preventDefault();
    if (typeof onClose === 'function') {
      onClose(event);
    }
    return true;
  }
  return false;
};

/**
 * 요소가 포커스 가능한지 확인합니다
 * @param {Element} element - 확인할 요소
 * @returns {boolean} 포커스 가능 여부
 */
export const isFocusable = (element) => {
  if (!element) return false;

  return element.matches(FOCUSABLE_ELEMENTS) &&
         element.offsetParent !== null &&
         getComputedStyle(element).visibility !== 'hidden' &&
         !element.hasAttribute('aria-hidden');
};

/**
 * ARIA 속성을 안전하게 설정합니다
 * @param {Element} element - 요소
 * @param {string} attribute - ARIA 속성명
 * @param {string} value - 속성값
 */
export const setAriaAttribute = (element, attribute, value) => {
  if (!element) return;

  try {
    element.setAttribute(attribute, value);
  } catch (error) {
    console.warn('ARIA 속성 설정 실패:', error);
  }
};

/**
 * 포커스 링을 보이거나 숨깁니다
 * @param {Element} element - 요소
 * @param {boolean} visible - 포커스 링 표시 여부
 */
export const setFocusRing = (element, visible) => {
  if (!element) return;

  if (visible) {
    element.style.outline = '2px solid #386937';
    element.style.outlineOffset = '2px';
  } else {
    element.style.outline = '';
    element.style.outlineOffset = '';
  }
};

/**
 * 여행보험 앱 전용 키보드 네비게이션 함수들
 */

/**
 * 키보드 이벤트가 엔터키 또는 스페이스키인지 확인
 * @param {KeyboardEvent} e - 키보드 이벤트
 * @returns {boolean}
 */
export const isEnterOrSpace = (e) => {
  return e.key === 'Enter' || e.key === ' ';
};

/**
 * 드롭다운 내부 버튼들 간의 방향키 네비게이션 처리
 * @param {KeyboardEvent} e - 키보드 이벤트
 * @param {HTMLElement} container - 드롭다운 컨테이너
 */
export const handleDropdownArrowNavigation = (e, container) => {
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    const buttons = container.querySelectorAll('button');
    const currentIndex = Array.from(buttons).indexOf(document.activeElement);
    const nextIndex = (currentIndex + 1) % buttons.length;
    buttons[nextIndex].focus();
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    const buttons = container.querySelectorAll('button');
    const currentIndex = Array.from(buttons).indexOf(document.activeElement);
    const prevIndex = currentIndex === 0 ? buttons.length - 1 : currentIndex - 1;
    buttons[prevIndex].focus();
  }
};

/**
 * 포커스가 특정 컨테이너 내부에 있는지 확인
 * @param {HTMLElement} container - 확인할 컨테이너
 * @returns {boolean}
 */
export const isFocusWithinContainer = (container) => {
  return container && container.contains(document.activeElement);
};

/**
 * 지연된 자동 드롭다운 열기 처리
 * @param {HTMLElement} targetElement - 포커스 확인할 요소
 * @param {Function} openCallback - 드롭다운 열기 콜백
 * @param {number} delay - 지연 시간 (기본 100ms)
 */
export const delayedDropdownOpen = (targetElement, openCallback, delay = 100) => {
  setTimeout(() => {
    if (document.activeElement === targetElement) {
      console.log('포커스가 유지되어 드롭다운 자동 열기 실행');
      openCallback();
    }
  }, delay);
};

/**
 * 드롭다운 외부 포커스 이동 시 닫기 처리
 * @param {HTMLElement} container - 드롭다운 컨테이너
 * @param {Function} closeCallback - 드롭다운 닫기 콜백
 * @param {number} delay - 지연 시간 (기본 10ms)
 */
export const handleDropdownBlur = (container, closeCallback, delay = 10) => {
  setTimeout(() => {
    if (!isFocusWithinContainer(container)) {
      console.log('드롭다운 외부로 포커스 이동 - 드롭다운 닫기');
      closeCallback();
    }
  }, delay);
};

/**
 * 달력 모달 Enter 키 적용 이벤트 핸들러 생성
 * @param {Function} applyCallback - 적용 버튼 콜백
 * @returns {Function} 이벤트 핸들러
 */
export const createCalendarEnterHandler = (applyCallback) => {
  return (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      console.log('달력에서 Enter 키 감지 - 적용 실행');
      applyCallback();
    }
  };
};

/**
 * Insert 페이지 Enter 키 다음 버튼 실행 핸들러 생성
 * @param {Function} isButtonDisabled - 버튼 비활성화 상태 확인 함수
 * @param {boolean} isModalOpen - 모달 열림 상태
 * @param {Function} handleNext - 다음 버튼 콜백
 * @returns {Function} 이벤트 핸들러
 */
export const createInsertEnterHandler = (isButtonDisabled, isModalOpen, handleNext) => {
  return (e) => {
    if (e.key === 'Enter' && !isModalOpen) {
      if (!isButtonDisabled()) {
        e.preventDefault();
        console.log('Insert 페이지에서 Enter 키 감지 - 다음 버튼 실행');
        handleNext();
      }
    }
  };
};

/**
 * TripSelect 페이지 Enter 키 다음 버튼 실행 핸들러 생성
 * @param {Function} isButtonDisabled - 버튼 비활성화 상태 확인 함수
 * @param {boolean} isModalOpen - 모달 열림 상태
 * @param {Function} handleNext - 다음 버튼 콜백
 * @returns {Function} 이벤트 핸들러
 */
export const createTripSelectEnterHandler = (isButtonDisabled, isModalOpen, handleNext) => {
  return (e) => {
    if (e.key === 'Enter' && !isModalOpen) {
      if (!isButtonDisabled()) {
        e.preventDefault();
        console.log('TripSelect 페이지에서 Enter 키 감지 - 다음 버튼 실행');
        handleNext();
      }
    }
  };
};

/**
 * 검색 입력 필드 키보드 이벤트 핸들러 생성
 * @param {Function} openModal - 검색 모달 열기 함수
 * @param {boolean} isModalOpen - 모달 열림 상태
 * @returns {Function} 이벤트 핸들러
 */
export const createSearchInputHandler = (openModal, isModalOpen) => {
  return (e) => {
    if ((e.key === 'Enter' || e.key === ' ') && !isModalOpen) {
      e.preventDefault();
      e.stopPropagation();
      console.log('검색 입력 필드에서 Enter/Space 키 감지 - 검색 모달 열기');
      openModal();
    }
  };
};

/**
 * 추천 국가 선택 키보드 이벤트 핸들러 생성
 * @param {Function} selectCountry - 국가 선택 함수
 * @param {Object} country - 선택할 국가 데이터
 * @returns {Function} 이벤트 핸들러
 */
export const createRecommendationHandler = (selectCountry, country) => {
  return (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      e.stopPropagation();
      console.log('추천 국가에서 Enter/Space 키 감지 - 국가 선택');
      selectCountry(country);
    }
  };
};

/**
 * 검색 모달 검색 결과 키보드 네비게이션 핸들러
 * @param {KeyboardEvent} e - 키보드 이벤트
 * @param {Array} results - 검색 결과 배열
 * @param {number} currentIndex - 현재 선택된 인덱스
 * @param {Function} setCurrentIndex - 인덱스 설정 함수
 * @param {Function} selectResult - 결과 선택 함수
 * @returns {boolean} 이벤트가 처리되었는지 여부
 */
export const handleSearchResultsNavigation = (e, results, currentIndex, setCurrentIndex, selectResult) => {
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault();
      const nextIndex = currentIndex < results.length - 1 ? currentIndex + 1 : 0;
      setCurrentIndex(nextIndex);
      return true;

    case 'ArrowUp':
      e.preventDefault();
      const prevIndex = currentIndex > 0 ? currentIndex - 1 : results.length - 1;
      setCurrentIndex(prevIndex);
      return true;

    case 'Enter':
      e.preventDefault();
      if (currentIndex >= 0 && currentIndex < results.length) {
        selectResult(results[currentIndex]);
      }
      return true;

    default:
      return false;
  }
};