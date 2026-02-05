# 키보드 네비게이션 접근성 라이브러리

이 라이브러리는 기존 컴포넌트를 수정하지 않고도 키보드 접근성을 쉽게 추가할 수 있는 독립적인 유틸리티와 컴포넌트들을 제공합니다.

## 📁 파일 구조

```
src/
├── utils/
│   └── keyboardNavigation.js     # 키보드 네비게이션 유틸리티 함수들
├── hooks/
│   ├── useFocusTrap.js          # 포커스 트랩 훅
│   └── useKeyboardNavigation.js  # 키보드 네비게이션 훅들
└── components/accessibility/
    ├── KeyboardNavigationWrapper.js  # 키보드 네비게이션 래퍼
    ├── AccessibleModal.js            # 접근 가능한 모달 컴포넌트
    └── README.md                     # 이 파일
```

## 🚀 사용법

### 1. KeyboardNavigationWrapper

기존 컴포넌트를 감싸서 키보드 네비게이션을 자동으로 추가합니다.

```jsx
import KeyboardNavigationWrapper from '../components/accessibility/KeyboardNavigationWrapper';

// 기본 사용법
<KeyboardNavigationWrapper>
  <button>버튼 1</button>
  <input type="text" placeholder="입력 필드" />
  <button>버튼 2</button>
</KeyboardNavigationWrapper>

// 화살표 키 네비게이션 활성화
<KeyboardNavigationWrapper enableArrowKeys={true}>
  <div tabIndex={0}>항목 1</div>
  <div tabIndex={0}>항목 2</div>
  <div tabIndex={0}>항목 3</div>
</KeyboardNavigationWrapper>
```

### 2. AccessibleModal

기존 모달에 키보드 접근성을 추가합니다.

```jsx
import AccessibleModal from '../components/accessibility/AccessibleModal';

function MyComponent() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <button onClick={() => setIsModalOpen(true)}>
        모달 열기
      </button>

      <AccessibleModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        ariaLabel="사용자 정보 모달"
      >
        <h2>사용자 정보</h2>
        <input type="text" placeholder="이름" />
        <button onClick={() => setIsModalOpen(false)}>
          닫기
        </button>
      </AccessibleModal>
    </>
  );
}
```

### 3. 훅 사용 예시

#### useFocusTrap

```jsx
import useFocusTrap from '../hooks/useFocusTrap';

function CustomModal({ isOpen, onClose }) {
  const { containerRef } = useFocusTrap({
    isActive: isOpen,
    autoFocus: true,
    restoreFocus: true,
    onEscape: onClose
  });

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop">
      <div ref={containerRef} className="modal">
        <button>첫 번째 버튼</button>
        <input type="text" />
        <button onClick={onClose}>닫기</button>
      </div>
    </div>
  );
}
```

#### useKeyboardNavigation

```jsx
import useKeyboardNavigation from '../hooks/useKeyboardNavigation';

function CustomButton({ onClick, children }) {
  const { elementRef, handleKeyDown } = useKeyboardNavigation({
    onEnter: onClick,
    onSpace: onClick
  });

  return (
    <div
      ref={elementRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onClick={onClick}
      role="button"
    >
      {children}
    </div>
  );
}
```

## 🎯 Overseas Insert 페이지 적용 예시

기존 overseas insert 페이지에 키보드 접근성을 추가하는 방법:

### 1. 전체 페이지 래핑

```jsx
// Insert.js 수정 없이 사용
import KeyboardNavigationWrapper from '../../../components/accessibility/KeyboardNavigationWrapper';
import AccessibleModal from '../../../components/accessibility/AccessibleModal';

function EnhancedInsert({ faRetrustData }) {
  return (
    <KeyboardNavigationWrapper>
      <Insert faRetrustData={faRetrustData} />
    </KeyboardNavigationWrapper>
  );
}
```

### 2. 모달만 개별 적용

```jsx
// InsertDate.js의 모달 부분만 래핑
import AccessibleModal from '../../../components/accessibility/AccessibleModal';

function EnhancedInsertDate({ faRetrustData }) {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <div className={styles.calendarBox}>
        <input
          onClick={() => setShowModal(true)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              setShowModal(true);
            }
          }}
          value={formatDate(startDate)}
          placeholder="출발일"
          readOnly
        />
      </div>

      <AccessibleModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        ariaLabel="날짜 선택 모달"
      >
        <DateSelectModal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
          // ... 기타 props
        />
      </AccessibleModal>
    </>
  );
}
```

### 3. 드롭다운 접근성 추가

```jsx
// Gender.js의 드롭다운에 키보드 지원 추가
import { useDropdownNavigation } from '../../../hooks/useKeyboardNavigation';

function EnhancedGenderDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const options = ['남', '여'];

  const { dropdownRef, handleKeyDown } = useDropdownNavigation({
    isOpen,
    items: options,
    selectedIndex,
    onSelect: (option) => {
      handleGenderSelect(option === '남' ? '남자' : '여자');
      setIsOpen(false);
    },
    onClose: () => setIsOpen(false),
    onIndexChange: setSelectedIndex
  });

  return (
    <div className={styles.genderInput}>
      <input
        value={getGenderString(userInfo.gender)}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        readOnly
      />

      {isOpen && (
        <div
          ref={dropdownRef}
          className={styles.GenderOption}
          onKeyDown={handleKeyDown}
        >
          {options.map((option, index) => (
            <button
              key={option}
              onClick={() => handleGenderSelect(option === '남' ? '남자' : '여자')}
              className={styles.genderBtn}
              role="menuitem"
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
```

## ⌨️ 지원하는 키보드 기능

### 기본 네비게이션
- **Tab**: 다음 요소로 이동
- **Shift + Tab**: 이전 요소로 이동
- **Enter/Space**: 버튼 활성화
- **Escape**: 모달/드롭다운 닫기

### 화살표 키 네비게이션 (옵션)
- **Arrow Up/Down**: 세로 네비게이션
- **Arrow Left/Right**: 가로 네비게이션
- **Home**: 첫 번째 요소로 이동
- **End**: 마지막 요소로 이동

### 드롭다운 전용
- **문자 키**: 해당 문자로 시작하는 항목으로 이동
- **Enter/Space**: 현재 항목 선택

## 🔧 커스터마이제이션

### KeyboardNavigationWrapper Props

```jsx
<KeyboardNavigationWrapper
  autoTabIndex={true}          // 자동 tabIndex 설정
  enableArrowKeys={false}      // 화살표 키 네비게이션 활성화
  wrapAround={true}           // 끝에서 처음으로 순환
  onFocusChange={(index, element) => {}} // 포커스 변경 콜백
  role="navigation"           // ARIA role 설정
  className="my-wrapper"      // CSS 클래스
/>
```

### AccessibleModal Props

```jsx
<AccessibleModal
  isOpen={true}
  onClose={() => {}}
  closeOnEsc={true}           // ESC 키로 닫기
  closeOnBackdropClick={true} // 배경 클릭으로 닫기
  autoFocus={true}            // 자동 포커스
  restoreFocus={true}         // 포커스 복원
  ariaLabel="모달 제목"       // ARIA 라벨
  ariaDescribedBy="desc-id"   // ARIA 설명 참조
/>
```

## 🎨 스타일링

컴포넌트들은 기본적으로 최소한의 스타일만 적용되어 있으며, 기존 스타일을 방해하지 않습니다. 필요에 따라 CSS 클래스나 인라인 스타일을 추가할 수 있습니다.

```jsx
// 포커스 링 스타일 커스터마이징
<KeyboardNavigationWrapper
  className="custom-focus-ring"
  style={{ '--focus-color': '#386937' }}
>
  {/* 내용 */}
</KeyboardNavigationWrapper>
```

## 🧪 테스트

키보드 접근성이 제대로 작동하는지 확인하려면:

1. **Tab 키 테스트**: Tab과 Shift+Tab으로 모든 요소에 접근 가능한지 확인
2. **Enter/Space 테스트**: 모든 버튼이 키보드로 활성화되는지 확인
3. **Escape 테스트**: 모달과 드롭다운이 ESC 키로 닫히는지 확인
4. **화살표 키 테스트**: 활성화된 경우 화살표 키 네비게이션이 작동하는지 확인
5. **포커스 트랩 테스트**: 모달 내에서 포커스가 제한되는지 확인

## 🔄 기존 코드와의 호환성

이 라이브러리는 기존 코드를 수정하지 않고도 사용할 수 있도록 설계되었습니다:

- **비침습적**: 기존 컴포넌트의 동작을 변경하지 않음
- **점진적 적용**: 필요한 부분부터 단계적으로 적용 가능
- **역호환성**: 기존 스타일과 이벤트 핸들러 유지

## 📝 주의사항

1. **중복 이벤트 핸들러**: 기존에 키보드 이벤트 핸들러가 있는 경우 충돌할 수 있으니 확인 필요
2. **CSS 우선순위**: 포커스 스타일이 기존 CSS에 의해 덮어쓰일 수 있음
3. **성능**: 큰 리스트에서는 `enableArrowKeys` 옵션 사용 시 성능 영향 고려
4. **브라우저 호환성**: 최신 브라우저 환경에서 최적화됨