import React, { useRef, useEffect, useCallback } from 'react';
import { getFocusableElements, focusElement, setAriaAttribute } from '../../utils/keyboardNavigation';

/**
 * 키보드 네비게이션 래퍼 컴포넌트
 * 자식 요소들에 자동으로 키보드 네비게이션 기능을 추가합니다
 *
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 자식 요소들
 * @param {boolean} props.autoTabIndex - 자동으로 tabIndex 설정 여부 (기본값: true)
 * @param {boolean} props.enableArrowKeys - 화살표 키 네비게이션 활성화 여부 (기본값: false)
 * @param {boolean} props.wrapAround - 끝에서 처음으로 순환할지 여부 (기본값: true)
 * @param {Function} props.onFocusChange - 포커스 변경 시 호출될 콜백
 * @param {string} props.className - CSS 클래스명
 * @param {Object} props.style - 인라인 스타일
 * @param {string} props.role - ARIA role 속성
 * @returns {JSX.Element} 키보드 네비게이션이 적용된 래퍼
 */
const KeyboardNavigationWrapper = ({
  children,
  autoTabIndex = true,
  enableArrowKeys = false,
  wrapAround = true,
  onFocusChange = null,
  className = '',
  style = {},
  role = null,
  ...otherProps
}) => {
  const containerRef = useRef(null);
  const currentFocusIndex = useRef(-1);

  // 포커스 가능한 요소들에 tabIndex 설정
  const setupTabIndices = useCallback(() => {
    if (!autoTabIndex || !containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);

    focusableElements.forEach((element, index) => {
      // 이미 tabIndex가 설정되어 있지 않은 경우에만 설정
      if (!element.hasAttribute('tabindex')) {
        element.setAttribute('tabindex', index === 0 ? '0' : '-1');
      }
    });
  }, [autoTabIndex]);

  // 특정 인덱스의 요소로 포커스 이동
  const focusElementAt = useCallback((index) => {
    if (!containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    if (index < 0 || index >= focusableElements.length) return;

    // 이전 요소의 tabIndex를 -1로 설정
    if (currentFocusIndex.current >= 0 && focusableElements[currentFocusIndex.current]) {
      focusableElements[currentFocusIndex.current].setAttribute('tabindex', '-1');
    }

    // 새 요소의 tabIndex를 0으로 설정하고 포커스
    const targetElement = focusableElements[index];
    targetElement.setAttribute('tabindex', '0');
    focusElement(targetElement);

    currentFocusIndex.current = index;

    // 포커스 변경 콜백 호출
    if (onFocusChange) {
      onFocusChange(index, targetElement);
    }
  }, [onFocusChange]);

  // 다음 요소로 포커스 이동
  const focusNext = useCallback(() => {
    if (!containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length === 0) return;

    let nextIndex = currentFocusIndex.current + 1;

    if (nextIndex >= focusableElements.length) {
      nextIndex = wrapAround ? 0 : focusableElements.length - 1;
    }

    focusElementAt(nextIndex);
  }, [focusElementAt, wrapAround]);

  // 이전 요소로 포커스 이동
  const focusPrevious = useCallback(() => {
    if (!containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    if (focusableElements.length === 0) return;

    let prevIndex = currentFocusIndex.current - 1;

    if (prevIndex < 0) {
      prevIndex = wrapAround ? focusableElements.length - 1 : 0;
    }

    focusElementAt(prevIndex);
  }, [focusElementAt, wrapAround]);

  // 키보드 이벤트 핸들러
  const handleKeyDown = useCallback((event) => {
    if (!enableArrowKeys) return;

    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowRight':
        event.preventDefault();
        focusNext();
        break;
      case 'ArrowUp':
      case 'ArrowLeft':
        event.preventDefault();
        focusPrevious();
        break;
      case 'Home':
        event.preventDefault();
        focusElementAt(0);
        break;
      case 'End':
        event.preventDefault();
        const focusableElements = getFocusableElements(containerRef.current);
        focusElementAt(focusableElements.length - 1);
        break;
      default:
        break;
    }
  }, [enableArrowKeys, focusNext, focusPrevious, focusElementAt]);

  // 포커스 이벤트 핸들러
  const handleFocus = useCallback((event) => {
    if (!containerRef.current) return;

    const focusableElements = getFocusableElements(containerRef.current);
    const focusedElement = event.target;
    const newIndex = focusableElements.indexOf(focusedElement);

    if (newIndex >= 0 && newIndex !== currentFocusIndex.current) {
      // 이전 요소의 tabIndex 업데이트
      if (currentFocusIndex.current >= 0 && focusableElements[currentFocusIndex.current]) {
        focusableElements[currentFocusIndex.current].setAttribute('tabindex', '-1');
      }

      // 새 요소의 tabIndex 업데이트
      focusedElement.setAttribute('tabindex', '0');
      currentFocusIndex.current = newIndex;

      // 포커스 변경 콜백 호출
      if (onFocusChange) {
        onFocusChange(newIndex, focusedElement);
      }
    }
  }, [onFocusChange]);

  // 초기 설정
  useEffect(() => {
    setupTabIndices();

    // MutationObserver로 DOM 변화 감지
    if (containerRef.current) {
      const observer = new MutationObserver(() => {
        setupTabIndices();
      });

      observer.observe(containerRef.current, {
        childList: true,
        subtree: true
      });

      return () => observer.disconnect();
    }
  }, [setupTabIndices]);

  // ARIA 속성 설정
  useEffect(() => {
    if (containerRef.current && role) {
      setAriaAttribute(containerRef.current, 'role', role);
    }
  }, [role]);

  return (
    <div
      ref={containerRef}
      className={className}
      style={style}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      {...otherProps}
    >
      {children}
    </div>
  );
};

export default KeyboardNavigationWrapper;