import React, { useEffect, useRef } from 'react';
import useFocusTrap from '../../hooks/useFocusTrap';
import { setAriaAttribute } from '../../utils/keyboardNavigation';

/**
 * 접근 가능한 모달 컴포넌트
 * 기존 모달을 감싸서 키보드 접근성을 자동으로 추가합니다
 *
 * @param {Object} props - 컴포넌트 props
 * @param {React.ReactNode} props.children - 모달 내용
 * @param {boolean} props.isOpen - 모달 열림 상태
 * @param {Function} props.onClose - 모달 닫기 콜백
 * @param {boolean} props.closeOnEsc - ESC 키로 닫기 활성화 여부 (기본값: true)
 * @param {boolean} props.closeOnBackdropClick - 배경 클릭으로 닫기 활성화 여부 (기본값: true)
 * @param {boolean} props.autoFocus - 자동 포커스 활성화 여부 (기본값: true)
 * @param {boolean} props.restoreFocus - 포커스 복원 활성화 여부 (기본값: true)
 * @param {string} props.className - CSS 클래스명
 * @param {Object} props.style - 인라인 스타일
 * @param {string} props.ariaLabel - ARIA 라벨
 * @param {string} props.ariaDescribedBy - ARIA 설명 참조
 * @returns {JSX.Element} 접근 가능한 모달
 */
const AccessibleModal = ({
  children,
  isOpen,
  onClose,
  closeOnEsc = true,
  closeOnBackdropClick = true,
  autoFocus = true,
  restoreFocus = true,
  className = '',
  style = {},
  ariaLabel = '모달 창',
  ariaDescribedBy = null,
  ...otherProps
}) => {
  const modalRef = useRef(null);
  const backdropRef = useRef(null);

  // 포커스 트랩 설정
  const { containerRef } = useFocusTrap({
    isActive: isOpen,
    autoFocus,
    restoreFocus,
    onEscape: closeOnEsc ? onClose : null
  });

  // 배경 클릭 이벤트 핸들러
  const handleBackdropClick = (event) => {
    if (!closeOnBackdropClick || !onClose) return;

    // 모달 내부를 클릭한 경우 무시
    if (modalRef.current && modalRef.current.contains(event.target)) {
      return;
    }

    // 배경을 클릭한 경우 모달 닫기
    if (backdropRef.current && backdropRef.current === event.target) {
      onClose();
    }
  };

  // ARIA 속성 설정
  useEffect(() => {
    if (!modalRef.current) return;

    const modal = modalRef.current;

    setAriaAttribute(modal, 'role', 'dialog');
    setAriaAttribute(modal, 'aria-modal', 'true');
    setAriaAttribute(modal, 'aria-label', ariaLabel);

    if (ariaDescribedBy) {
      setAriaAttribute(modal, 'aria-describedby', ariaDescribedBy);
    }
  }, [ariaLabel, ariaDescribedBy]);

  // body 스크롤 제어
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // 모달이 열리지 않은 경우 렌더링하지 않음
  if (!isOpen) return null;

  return (
    <div
      ref={backdropRef}
      className={`fixed inset-0 z-50 flex items-center justify-center ${className}`}
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        ...style
      }}
      onClick={handleBackdropClick}
      {...otherProps}
    >
      <div
        ref={(el) => {
          modalRef.current = el;
          containerRef.current = el;
        }}
        className="relative bg-white rounded-lg shadow-lg max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
};

/**
 * 접근 가능한 드롭다운 컴포넌트
 * 기존 드롭다운을 감싸서 키보드 접근성을 자동으로 추가합니다
 */
export const AccessibleDropdown = ({
  children,
  isOpen,
  onClose,
  trigger,
  className = '',
  style = {},
  placement = 'bottom',
  ...otherProps
}) => {
  const dropdownRef = useRef(null);
  const triggerRef = useRef(null);

  // 포커스 트랩 설정
  const { containerRef } = useFocusTrap({
    isActive: isOpen,
    autoFocus: true,
    restoreFocus: true,
    onEscape: onClose
  });

  // 외부 클릭 감지
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        triggerRef.current &&
        !triggerRef.current.contains(event.target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  // ARIA 속성 설정
  useEffect(() => {
    if (!dropdownRef.current) return;

    setAriaAttribute(dropdownRef.current, 'role', 'menu');
    setAriaAttribute(dropdownRef.current, 'aria-expanded', isOpen.toString());
  }, [isOpen]);

  return (
    <div className="relative inline-block">
      {/* 트리거 요소 */}
      <div
        ref={triggerRef}
        onClick={() => onClose && onClose()}
      >
        {trigger}
      </div>

      {/* 드롭다운 메뉴 */}
      {isOpen && (
        <div
          ref={(el) => {
            dropdownRef.current = el;
            containerRef.current = el;
          }}
          className={`absolute z-50 bg-white border border-gray-300 rounded-md shadow-lg ${
            placement === 'bottom' ? 'top-full mt-1' : 'bottom-full mb-1'
          } ${className}`}
          style={style}
          {...otherProps}
        >
          {children}
        </div>
      )}
    </div>
  );
};

/**
 * 접근 가능한 툴팁 컴포넌트
 * 키보드로도 접근 가능한 툴팁을 제공합니다
 */
export const AccessibleTooltip = ({
  children,
  content,
  isVisible,
  onVisibilityChange,
  placement = 'top',
  className = '',
  ...otherProps
}) => {
  const tooltipRef = useRef(null);
  const triggerRef = useRef(null);
  const tooltipId = useRef(`tooltip-${Date.now()}`);

  // 키보드 이벤트 핸들러
  const handleKeyDown = (event) => {
    if (event.key === 'Escape' && isVisible) {
      onVisibilityChange(false);
    }
  };

  // 포커스/블러 이벤트 핸들러
  const handleFocus = () => onVisibilityChange(true);
  const handleBlur = () => onVisibilityChange(false);

  // ARIA 속성 설정
  useEffect(() => {
    if (!triggerRef.current) return;

    const trigger = triggerRef.current;
    setAriaAttribute(trigger, 'aria-describedby', tooltipId.current);
  }, []);

  return (
    <div className="relative inline-block">
      <div
        ref={triggerRef}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onMouseEnter={handleFocus}
        onMouseLeave={handleBlur}
        tabIndex={0}
        {...otherProps}
      >
        {children}
      </div>

      {isVisible && (
        <div
          ref={tooltipRef}
          id={tooltipId.current}
          role="tooltip"
          className={`absolute z-50 px-2 py-1 text-sm bg-gray-800 text-white rounded ${
            placement === 'top' ? 'bottom-full mb-2' : 'top-full mt-2'
          } ${className}`}
        >
          {content}
        </div>
      )}
    </div>
  );
};

export default AccessibleModal;