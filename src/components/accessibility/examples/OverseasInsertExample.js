/**
 * Overseas Insert 페이지에 키보드 접근성을 적용하는 예시
 * 기존 코드를 수정하지 않고 래퍼 컴포넌트만으로 접근성을 추가합니다
 */

import React, { useState } from 'react';
import KeyboardNavigationWrapper from '../KeyboardNavigationWrapper';
import AccessibleModal from '../AccessibleModal';
import { useInputNavigation, useDropdownNavigation } from '../../../hooks/useKeyboardNavigation';
import { focusElement } from '../../../utils/keyboardNavigation';

// 기존 Insert 컴포넌트를 그대로 사용하면서 키보드 접근성만 추가
import Insert from '../../../apps/trip/overseas/Insert';

/**
 * 1. 전체 페이지 래핑 방식
 * 가장 간단한 방법으로 전체 Insert 컴포넌트를 래핑
 */
export const EnhancedOverseasInsert = ({ faRetrustData }) => {
  return (
    <KeyboardNavigationWrapper
      enableArrowKeys={false} // 일반적인 폼에서는 화살표 키 비활성화
      onFocusChange={(index, element) => {
        console.log(`포커스가 ${index}번째 요소로 이동:`, element);
      }}
    >
      <Insert faRetrustData={faRetrustData} />
    </KeyboardNavigationWrapper>
  );
};

/**
 * 2. 개별 컴포넌트 방식
 * 특정 부분만 선택적으로 키보드 접근성을 적용
 */

// 날짜 선택 필드 예시
export const AccessibleDateInput = ({
  value,
  placeholder,
  onClick,
  onModalOpen,
  className
}) => {
  const { inputRef, handleKeyDown } = useInputNavigation({
    onSubmit: (event) => {
      // 엔터키로 모달 열기
      if (onModalOpen) onModalOpen();
    },
    submitOnEnter: true
  });

  return (
    <input
      ref={inputRef}
      value={value}
      placeholder={placeholder}
      className={className}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      readOnly
      aria-label={placeholder}
      role="button" // 클릭 가능한 필드임을 명시
      tabIndex={0}
    />
  );
};

// 성별 드롭다운 예시
export const AccessibleGenderDropdown = ({
  isOpen,
  selectedGender,
  onToggle,
  onSelect,
  className
}) => {
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const options = [
    { label: '남', value: '남자' },
    { label: '여', value: '여자' }
  ];

  const { dropdownRef, setItemRef, handleKeyDown } = useDropdownNavigation({
    isOpen,
    items: options,
    selectedIndex,
    onSelect: (option, index) => {
      onSelect(option.value);
      onToggle(false);
    },
    onClose: () => onToggle(false),
    onIndexChange: setSelectedIndex
  });

  const handleTriggerKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onToggle(!isOpen);
    } else if (event.key === 'ArrowDown' && !isOpen) {
      event.preventDefault();
      onToggle(true);
    }
  };

  return (
    <div className="relative">
      {/* 드롭다운 트리거 */}
      <input
        value={selectedGender || '성별선택'}
        readOnly
        className={className}
        onClick={() => onToggle(!isOpen)}
        onKeyDown={handleTriggerKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label="성별 선택"
        tabIndex={0}
      />

      {/* 드롭다운 옵션들 */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className="absolute top-full left-0 bg-white border rounded shadow-lg z-10"
          onKeyDown={handleKeyDown}
          role="listbox"
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(el) => setItemRef(el, index)}
              onClick={() => {
                onSelect(option.value);
                onToggle(false);
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 focus:bg-gray-100"
              role="option"
              aria-selected={index === selectedIndex}
              tabIndex={-1}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// 날짜 선택 모달 예시
export const AccessibleDateModal = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  return (
    <AccessibleModal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabel={title}
      closeOnEsc={true}
      closeOnBackdropClick={true}
      className="date-modal"
    >
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-4">{title}</h2>
        {children}
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring-2"
          >
            취소
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 focus:outline-none focus:ring-2"
          >
            확인
          </button>
        </div>
      </div>
    </AccessibleModal>
  );
};

/**
 * 3. 통합 예시
 * 위의 모든 컴포넌트들을 조합한 완전한 예시
 */
export const CompleteAccessibleForm = () => {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [gender, setGender] = useState('');
  const [isStartModalOpen, setIsStartModalOpen] = useState(false);
  const [isEndModalOpen, setIsEndModalOpen] = useState(false);
  const [isGenderDropdownOpen, setIsGenderDropdownOpen] = useState(false);

  return (
    <KeyboardNavigationWrapper className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">보험료 계산 정보 입력</h1>

      {/* 여행 일정 섹션 */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">여행 일정</h2>
        <div className="flex gap-4">
          <AccessibleDateInput
            value={startDate}
            placeholder="출발일"
            onClick={() => setIsStartModalOpen(true)}
            onModalOpen={() => setIsStartModalOpen(true)}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2"
          />
          <AccessibleDateInput
            value={endDate}
            placeholder="도착일"
            onClick={() => setIsEndModalOpen(true)}
            onModalOpen={() => setIsEndModalOpen(true)}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2"
          />
        </div>
      </section>

      {/* 가입자 정보 섹션 */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold mb-3">가입자 정보</h2>
        <div className="flex gap-4">
          <input
            type="tel"
            placeholder="생년월일 (예: 19910211)"
            maxLength={8}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2"
            aria-label="생년월일 입력"
          />
          <AccessibleGenderDropdown
            isOpen={isGenderDropdownOpen}
            selectedGender={gender}
            onToggle={setIsGenderDropdownOpen}
            onSelect={setGender}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2"
          />
        </div>
      </section>

      {/* 동반인 추가 버튼 */}
      <button
        className="w-full p-3 bg-green-50 text-green-700 border border-green-200 rounded hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-500"
        aria-label="동반인 추가하기"
      >
        + 동반인 추가하기
      </button>

      {/* 다음 버튼 */}
      <button
        className="w-full mt-6 p-3 bg-green-600 text-white rounded hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
        disabled={!startDate || !endDate || !gender}
      >
        다음
      </button>

      {/* 모달들 */}
      <AccessibleDateModal
        isOpen={isStartModalOpen}
        onClose={() => setIsStartModalOpen(false)}
        title="출발일을 선택해주세요"
      >
        <div className="text-center py-8">
          {/* 여기에 캘린더 컴포넌트가 들어갑니다 */}
          <p>캘린더 컴포넌트</p>
        </div>
      </AccessibleDateModal>

      <AccessibleDateModal
        isOpen={isEndModalOpen}
        onClose={() => setIsEndModalOpen(false)}
        title="도착일을 선택해주세요"
      >
        <div className="text-center py-8">
          {/* 여기에 캘린더 컴포넌트가 들어갑니다 */}
          <p>캘린더 컴포넌트</p>
        </div>
      </AccessibleDateModal>
    </KeyboardNavigationWrapper>
  );
};

/**
 * 4. 점진적 적용 방식
 * 기존 코드에 최소한의 변경으로 적용하는 방법
 */

// HOC(Higher-Order Component) 방식
export const withKeyboardAccessibility = (WrappedComponent) => {
  return function AccessibleComponent(props) {
    return (
      <KeyboardNavigationWrapper>
        <WrappedComponent {...props} />
      </KeyboardNavigationWrapper>
    );
  };
};

// 사용법:
// const AccessibleInsert = withKeyboardAccessibility(Insert);

/**
 * 5. 실제 적용 가이드
 *
 * 단계 1: 전체 래핑으로 시작
 * - 기존 Insert 컴포넌트를 KeyboardNavigationWrapper로 래핑
 *
 * 단계 2: 개별 개선
 * - 날짜 입력 필드에 AccessibleDateInput 적용
 * - 드롭다운에 AccessibleGenderDropdown 적용
 *
 * 단계 3: 모달 개선
 * - DateSelectModal을 AccessibleModal로 래핑
 *
 * 단계 4: 세부 튜닝
 * - 포커스 순서 조정
 * - ARIA 라벨 추가
 * - 키보드 단축키 추가
 */

export default {
  EnhancedOverseasInsert,
  AccessibleDateInput,
  AccessibleGenderDropdown,
  AccessibleDateModal,
  CompleteAccessibleForm,
  withKeyboardAccessibility
};