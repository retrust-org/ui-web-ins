# disasterHouse V3 API 통합 완료 가이드 v2.0

**작성일**: 2025-12-19
**버전**: 2.0
**브랜치**: feature/disaster-house
**상태**: ✅ 빌드 성공, 배포 완료
**참고**: disasterSafeguard 패턴 적용

---

## 📋 작업 개요

disasterSafeguard에 적용된 V3 API, 보안 컨텍스트, 동의 API, 본인인증, 전자서명, 사업자검증 기능을 disasterHouse에 동일하게 적용 완료했습니다.

**v2.0 주요 변경사항**:
- API 엔드포인트 수정 (`/housing/` 세그먼트 제거)
- PaymentContract 필드 수정 (`athNo` 제거, `encryptedFields` 사용)
- 동의처리 에러 UX 개선 (사용자 친화적 메시지, `/price` 리다이렉트)

---

## ✅ 수정된 파일 (총 10개)

### 1. 인프라 설정 (1개)
- ✅ `src/apps/safety/disasterHouse/Router.jsx`

### 2. SessionToken 발급 (1개)
- ✅ `src/apps/safety/disasterHouse/price/index.js`

### 3. 동의 API 적용 (4개)
- ✅ `src/apps/safety/disasterHouse/consentform/LimitsAnnounce.js`
- ✅ `src/apps/safety/disasterHouse/consentform/ConsentAgreement.js`
- ✅ `src/apps/safety/disasterHouse/consentform/PersonalInfoConsent.js`
- ✅ `src/apps/safety/disasterHouse/consentform/SignupChkConsent.js` (v2.0 에러 처리 개선)

### 4. API V3 업그레이드 (2개)
- ✅ `src/apps/safety/disasterHouse/confirm/ProvisionalContract.js` (v2.0 엔드포인트 수정)
- ✅ `src/apps/safety/disasterHouse/pay/PaymentContract.js` (v2.0 필드명 수정)

### 5. 전자서명 기능 (1개)
- ✅ `src/apps/safety/disasterHouse/document/index.js`

### 6. 사업자검증 (1개)
- ✅ `src/apps/safety/disasterHouse/userinfo/BusinessInfo.js`

---

## 📊 Phase별 작업 내역

### Phase 1: SessionProvider 인프라 구축

**파일**: `Router.jsx`

**변경사항**:
```jsx
// ✅ 추가
import { SessionProvider } from '../../../context/SessionContext';

// ✅ 전체 앱을 SessionProvider로 래핑
<SessionProvider>
  <DisasterHouseProvider>
    <Routes>...</Routes>
  </DisasterHouseProvider>
</SessionProvider>
```

**효과**: 전체 앱에서 `useSession()` 훅으로 sessionToken 접근 가능

---

### Phase 2: sessionToken 발급 로직

**파일**: `price/index.js`

**핵심 코드**:
```javascript
import { useSession } from '../../../../context/SessionContext';
import { getSessionToken } from '../../services/consentService';

const { setSessionToken } = useSession();

// ✅ sessionToken 발급 함수
const fetchSessionToken = async () => {
    const result = await getSessionToken('signup', 'mrz_disaster');
    setSessionToken(result.sessionToken, result.expiresAt);
    return result.sessionToken;
};

// ✅ 보험료 조회 시 발급 (실패해도 계속 진행)
const handleConfirmClick = async () => {
    try {
        setIsLoading(true);
        try {
            await fetchSessionToken();
        } catch (tokenError) {
            console.warn("sessionToken 발급 실패 (보험료 계산은 계속 진행):", tokenError);
        }
        const result = await handleFetchPremium();
        if (result) {
            setShowResultModal(true);
        }
    } finally {
        setIsLoading(false);
    }
};
```

**효과**:
- 30분 유효 sessionToken 발급
- sessionStorage에 저장되어 모든 후속 API 호출에 사용
- 발급 실패 시에도 보험료 계산은 정상 진행

---

### Phase 3: 동의 API 통합 (4개 파일)

#### 3.1 LimitsAnnounce.js - 초과가입 제한 안내
**Template ID**: 100

#### 3.2 ConsentAgreement.js - 개인신용정보 동의
**Template IDs**: 101-109

**동의 항목 매핑**:
```javascript
const TEMPLATE_IDS = {
  0: 101, // 수집이용 - 고유식별정보
  1: 102, // 수집이용 - 민감정보
  2: 103, // 수집이용 - 개인신용정보
  3: 104, // 제공 - 고유식별정보
  4: 105, // 제공 - 민감정보
  5: 106, // 제공 - 개인신용정보
  6: 107, // 조회 - 고유식별정보
  7: 108, // 조회 - 민감정보
  8: 109, // 조회 - 개인신용정보
};
```

#### 3.3 PersonalInfoConsent.js - 상세 개인정보 동의
**Template IDs**: 201-209

#### 3.4 SignupChkConsent.js - 가입 전 확인 + 본인인증
**Template ID**: 300

**✨ v2.0 개선사항**: 사용자 친화적 에러 처리

```javascript
import { recordConsent, ConsentError, isSessionError, getErrorMessage } from "../../services/consentService";

const [isConsentError, setIsConsentError] = useState(false);

const handleNext = async () => {
    if (!sessionToken) {
        setIsConsentError(true);
        setError('세션이 만료되었네요.\n보험료 조회부터 다시 진행해 주세요.');
        return;
    }

    try {
        await recordConsent(sessionToken, {
            templateId: 300,
            consentVersion: '1.0',
            isAgreed: true
        });
        openAuthPopup(sessionToken, 'disaster-house');
    } catch (err) {
        setIsConsentError(true);

        // ✨ v2.0: 사용자 친화적 에러 메시지
        if (err instanceof ConsentError) {
            if (isSessionError(err.code)) {
                setError('동의 처리 중 세션이 만료되었네요.\n보험료 조회부터 다시 진행해 주세요.');
            } else {
                setError(getErrorMessage(err.code, err.reason));
            }
        } else {
            setError('동의 처리 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
        }
    }
};

// ✨ v2.0: 동의처리 에러 시에도 /price로 리다이렉트
const handleCloseError = () => {
    setError(null);
    if (isAuthError || isConsentError) {
        setIsAuthError(false);
        setIsConsentError(false);
        navigate('/price');
    }
};
```

**v2.0 효과**:
- "동의 처리 중 세션이 만료되었네요" 메시지로 사용자 친화성 향상
- 세션 에러 발생 시 자동으로 `/price`로 이동하여 처음부터 재시작 가능

---

### Phase 4: API V3 업그레이드

#### 4.1 ProvisionalContract.js - 가계약 API

**✨ v2.0 중요 수정**: API 엔드포인트 변경

```javascript
// ❌ v1.0 (잘못됨)
const apiUrl = `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/housing/premium/provisional`;

// ✅ v2.0 (올바름)
const apiUrl = `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/premium/provisional`;
```

**변경사항**:
1. ✅ `/housing/` 세그먼트 제거
2. ✅ `X-Session-Token` 헤더 사용

```javascript
// V3 API: sessionStorage에서 sessionToken 가져오기
const sessionContext = JSON.parse(sessionStorage.getItem('session_context') || '{}');
const sessionToken = sessionContext.sessionToken || '';

const response = await fetch(
    `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/premium/provisional`,
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
            'X-Session-Token': sessionToken
        },
        body: JSON.stringify(requestBody)
    }
);
```

#### 4.2 PaymentContract.js - 결제계약 API

**✨ v2.0 중요 수정**: API 엔드포인트 및 필드명 변경

```javascript
// ❌ v1.0 (잘못됨)
const apiUrl = `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/housing/contract`;
const requestBody = {
    athNo: athNo,                    // ❌ V3에서 불필요
    encryptedPayment: encryptedPayment  // ❌ 잘못된 필드명
};

// ✅ v2.0 (올바름)
const apiUrl = `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/contract`;
const requestBody = {
    // athNo 제거됨 (인증은 X-Session-Token 헤더로 처리)
    encryptedFields: encryptedPayment  // ✅ 올바른 필드명
};
```

**변경사항**:
1. ✅ `/housing/` 세그먼트 제거
2. ✅ `athNo` 필드 제거 (V3는 X-Session-Token으로 인증)
3. ✅ `encryptedPayment` → `encryptedFields` 필드명 수정

```javascript
const { prctrNo, efctPrd, dporNm, rcptPrem, paymentMethod, bnkCd, bnkNm, encryptedPayment } = paymentData;

const requestBody = {
    ctrCcluYn: "1",
    pdCd: "17604",
    prctrNo: prctrNo,
    rcptPrem: String(rcptPrem),
    pyrcShDtlCd: paymentMethod === 'card' ? '104' : '101',
    dporNm: dporNm,
    encryptedFields: encryptedPayment  // ✅ v2.0 수정
};

if (paymentMethod === 'card') {
    requestBody.efctPrd = efctPrd;
} else {
    requestBody.bnkCd = bnkCd;
    requestBody.bnkNm = bnkNm;
}

const response = await fetch(
    `${process.env.REACT_APP_BASE_URL}/disaster-api/api/v3/disaster/contract`,
    {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': csrfToken,
            'X-Session-Token': sessionToken
        },
        body: JSON.stringify(requestBody)
    }
);
```

---

### Phase 5: 전자서명 postMessage 통신

**파일**: `document/index.js`

**추가된 기능**:
1. `useSession()` 훅 (sessionToken, clearSession)
2. 서명 완료 상태 추적 (`isSigned1`, `isSigned2`)
3. postMessage 이벤트 리스너 (SIGNATURE_COMPLETE, SESSION_EXPIRED)
4. origin 검증 (`retrust.world`)
5. sessionToken을 쿼리 파라미터로 전달

**핵심 코드**:
```javascript
const { sessionToken, clearSession } = useSession();
const [isSigned1, setIsSigned1] = useState(false);
const [isSigned2, setIsSigned2] = useState(false);

// postMessage로 서명 완료 이벤트 수신
useEffect(() => {
    const handleMessage = (event) => {
        if (!event.origin.includes('retrust.world')) {
            return;
        }

        const { type, documentType, redirectTo } = event.data;

        if (type === 'SIGNATURE_COMPLETE') {
            if (documentType === 'product_guide' && !isSigned1) {
                setIsSigned1(true);
            } else if (documentType === 'subscription' && !isSigned2) {
                setIsSigned2(true);
            }
        }

        if (type === 'SESSION_EXPIRED') {
            clearSession();
            navigate(redirectTo || '/price');
        }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
}, [isSigned1, isSigned2, clearSession, navigate]);

// 전자서명 팝업 열기 (sessionToken 전달)
const handleOpenDoc1 = () => {
    if (!sessionToken) {
        setErrorModal({
            isOpen: true,
            message: "세션이 만료되었습니다.\n처음부터 다시 진행해주세요."
        });
        return;
    }

    const url = `${contractData.rltLinkUrl1}?sessionToken=${encodeURIComponent(sessionToken)}`;
    window.open(url, 'signaturePopup1', 'width=900,height=700');
};
```

---

### Phase 6: 사업자검증 서버 API 연동

**파일**: `userinfo/BusinessInfo.js`

**추가된 기능**:
1. 상호명 입력 필드
2. 사업자번호 검증 API 호출 (국세청 연동)
3. 에러 코드별 메시지 표시

**에러 코드별 메시지**:
- **70020**: 휴업/폐업 중인 사업자
- **70021**: 등록되지 않은 사업자번호
- **70022**: 사업자번호와 상호명 불일치

---

## 🔐 보안 및 인증 플로우

### 두 가지 인증 토큰 체계

disasterHouse는 **CSRF 토큰**과 **Session 토큰** 두 가지 인증 방식을 사용합니다.

#### CSRF 토큰 (X-CSRF-Token)
- **관리**: `csrfManager` (전역 싱글톤)
- **용도**: disaster-api 엔드포인트 호출 시 사용
  - Premium API (보험료 조회)
  - Provisional Contract API (가계약 생성)
  - Payment API (결제 처리)
- **특징**:
  - 요청 실패 시 자동으로 토큰 재발급 및 재시도
  - 서버 오류나 토큰 만료 시 자동 갱신

#### Session 토큰 (X-Session-Token)
- **관리**: `SessionContext` (React Context)
- **용도**: sign-api 엔드포인트 호출 시 사용
  - `getSessionToken()` - 세션 토큰 발급
  - `recordConsent()` - 동의 기록 저장
- **발급**:
  - **최초 발급**: `price/index.js`에서 보험료 조회 시
  - **갱신**: `SignupChkConsent.js`에서 본인인증 성공 시
- **특징**:
  - 30분 유효 (서버 설정)
  - 본인인증 전: `authenticated: false`
  - 본인인증 후: `authenticated: true` (갱신된 토큰 저장)
  - 만료 시 `/price`로 리다이렉트

### sessionToken 생명주기

#### 1. 발급 시점: 보험료 조회
- **파일**: `price/index.js`
- **URL**: `/sign-api/nice/api/session-token`
- **파라미터**:
  - purpose: `signup`
  - clientId: `mrz_disaster`
- **유효기간**: 30분
- **상태**: authenticated: false
- **저장**: `sessionStorage`의 `session_context` 키

#### 2. 갱신 시점: 본인인증 성공
- **파일**: `SignupChkConsent.js`
- 기존 sessionToken을 본인인증 서비스에 전달
- 본인인증 성공 시 새로운 sessionToken 발급받음
- **상태**: authenticated: true
- **유효기간**: 30분 (재설정)

#### 3. 사용 시점
- **동의 기록 API** (4회):
  - LimitsAnnounce (템플릿 100)
  - ConsentAgreement (템플릿 101-109)
  - PersonalInfoConsent (템플릿 201-209)
  - SignupChkConsent (템플릿 300)
- **전자서명 URL** 쿼리 파라미터로 전달

#### 4. 만료 처리
- 전자서명 페이지에서 SESSION_EXPIRED postMessage 수신 시
- 세션 클리어 후 `/price`로 이동

### API 인증 헤더 구조

| API 종류 | 헤더 | 토큰 관리 | 사용 페이지 |
|---------|------|----------|------------|
| **Sign API** | X-Session-Token | SessionContext | price, 모든 동의 페이지, 본인인증 |
| **Disaster API** | X-CSRF-Token | csrfManager | price (보험료 조회), confirm (가계약), pay (결제) |

```javascript
// Sign API 호출 예시
headers: {
    'Content-Type': 'application/json',
    'X-Session-Token': sessionToken
}

// Disaster API 호출 예시
headers: {
    'Content-Type': 'application/json',
    'X-CSRF-Token': csrfToken,
    'X-Session-Token': sessionToken  // V3 API는 두 헤더 모두 필요
}
```

---

## 📚 API 엔드포인트 참조

### ✅ v2.0 올바른 엔드포인트

| API | 엔드포인트 | 메서드 |
|-----|-----------|--------|
| Session Token | `/sign-api/nice/api/session-token` | GET |
| Consent Record | `/sign-api/api/consent/record` | POST |
| Premium | `/disaster-api/api/v3/disaster/premium` | POST |
| **Provisional** | `/disaster-api/api/v3/disaster/premium/provisional` | POST |
| **Contract** | `/disaster-api/api/v3/disaster/contract` | POST |
| Business Verify | `/disaster-api/api/v3/disaster/business/verify` | POST |

### ❌ v1.0 잘못된 엔드포인트 (deprecated)

| API | 잘못된 엔드포인트 | 문제 |
|-----|-----------------|------|
| Provisional | `/disaster-api/api/v3/disaster/housing/premium/provisional` | `/housing/` 불필요 |
| Contract | `/disaster-api/api/v3/disaster/housing/contract` | `/housing/` 불필요 |

---

## ❌ 에러 처리

### ConsentError 클래스

**파일**: `src/apps/safety/services/consentService.js`

```javascript
export class ConsentError extends Error {
  constructor(message, code, reason = null) {
    super(message);
    this.name = 'ConsentError';
    this.code = code;      // 에러 코드
    this.reason = reason;  // 상세 원인
  }
}

// 에러 코드 상수
export const ERROR_CODES = {
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  SESSION_BLOCKED: 'SESSION_BLOCKED',
  SESSION_INVALID: 'SESSION_INVALID',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  SERVER_ERROR: 'SERVER_ERROR',
  MISSING_SESSION_TOKEN: 'MISSING_SESSION_TOKEN'
};
```

### 에러 메시지 변환 (사용자 친화적)

```javascript
export function getErrorMessage(code, reason = null) {
  // reason 기반 상세 메시지
  if (code === ERROR_CODES.SESSION_EXPIRED && reason) {
    const reasonMessages = {
      'IP_CHANGED': '네트워크가 변경되어 세션이 만료되었습니다. 본인인증을 다시 진행해주세요.',
      'DEVICE_CHANGED': '브라우저 정보가 변경되어 세션이 만료되었습니다. 본인인증을 다시 진행해주세요.',
      'SESSION_TIMEOUT': '30분 동안 활동이 없어 세션이 만료되었습니다. 본인인증을 다시 진행해주세요.',
      'CONTEXT_NOT_FOUND': '유효하지 않은 세션입니다. 본인인증을 다시 진행해주세요.'
    };
    return reasonMessages[reason] || '세션이 만료되었습니다. 처음부터 다시 진행해 주세요.';
  }

  const messages = {
    [ERROR_CODES.SESSION_EXPIRED]: '세션이 만료되었습니다. 처음부터 다시 진행해 주세요.',
    [ERROR_CODES.SESSION_BLOCKED]: '보안상의 이유로 세션이 차단되었습니다. 처음부터 다시 진행해 주세요.',
    [ERROR_CODES.SESSION_INVALID]: '유효하지 않은 세션입니다. 처음부터 다시 진행해 주세요.',
    [ERROR_CODES.VALIDATION_ERROR]: '입력 정보를 확인해 주세요.',
    [ERROR_CODES.NETWORK_ERROR]: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    [ERROR_CODES.SERVER_ERROR]: '서버 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
    [ERROR_CODES.MISSING_SESSION_TOKEN]: '세션 정보가 없습니다. 보험료 조회부터 다시 진행해주세요.'
  };

  return messages[code] || '오류가 발생했습니다. 잠시 후 다시 시도해 주세요.';
}
```

### v2.0 에러 처리 개선사항

**SignupChkConsent.js에서의 사용 예시**:

```javascript
import { ConsentError, isSessionError, getErrorMessage } from '../../services/consentService';

const [isConsentError, setIsConsentError] = useState(false);

try {
  await recordConsent(sessionToken, {
    templateId: 300,
    consentVersion: '1.0',
    isAgreed: true
  });
} catch (err) {
  setIsConsentError(true);

  // ✨ v2.0: 사용자 친화적 에러 처리
  if (err instanceof ConsentError) {
    if (isSessionError(err.code)) {
      setError('동의 처리 중 세션이 만료되었네요.\n보험료 조회부터 다시 진행해 주세요.');
    } else {
      setError(getErrorMessage(err.code, err.reason));
    }
  } else {
    setError('동의 처리 중 오류가 발생했습니다.\n잠시 후 다시 시도해 주세요.');
  }
}

// ✨ v2.0: 동의처리 에러 시에도 /price로 리다이렉트
const handleCloseError = () => {
  setError(null);
  if (isAuthError || isConsentError) {
    setIsAuthError(false);
    setIsConsentError(false);
    navigate('/price');
  }
};
```

### 세션 관련 에러 확인

```javascript
// 에러 코드가 세션 관련 에러인지 확인
export function isSessionError(code) {
  return [
    ERROR_CODES.SESSION_EXPIRED,
    ERROR_CODES.SESSION_BLOCKED,
    ERROR_CODES.SESSION_INVALID,
    ERROR_CODES.MISSING_SESSION_TOKEN
  ].includes(code);
}
```

---

## ⚠️ 주의사항

### 1. sessionToken 관리
- sessionToken은 sessionStorage에 저장되므로 **브라우저 탭을 닫으면 소멸**
- 유효기간 30분 후 자동 만료
- 본인인증 후 반드시 갱신된 토큰으로 교체해야 함

### 2. API 버전 혼용 금지
- V2 API와 V3 API를 혼용하지 말 것
- 모든 API가 V3로 통일되어야 sessionToken 기반 세션 관리가 정상 작동

### 3. 동의 템플릿 ID 관리

| Template ID | 동의 항목 |
|------------|----------|
| 100 | 초과가입 제한 안내 |
| 101-109 | 개인신용정보 동의 (9개) |
| 201-209 | 상세 개인정보 동의 (9개) |
| 300 | 가입 전 확인사항 |

### 4. v2.0 필수 수정사항 재확인

#### ✅ ProvisionalContract.js
```javascript
// 엔드포인트에서 /housing/ 제거
`/disaster-api/api/v3/disaster/premium/provisional`
```

#### ✅ PaymentContract.js
```javascript
// 1. 엔드포인트에서 /housing/ 제거
`/disaster-api/api/v3/disaster/contract`

// 2. athNo 필드 제거
// 3. encryptedFields 필드명 사용
const requestBody = {
    encryptedFields: encryptedPayment  // ✅
};
```

#### ✅ SignupChkConsent.js
```javascript
// 1. isConsentError 상태 추가
// 2. ConsentError, isSessionError, getErrorMessage import
// 3. 사용자 친화적 에러 메시지
// 4. 동의처리 에러 시에도 /price로 리다이렉트
```

---

## 📦 배포 가이드

### 빌드 명령어
```bash
# 개발 서버
npm run start:house

# 프로덕션 빌드
npm run build:house
```

### 배포 경로
```
/var/www/safety/disasterHouse/
```

---

## 📝 변경 이력

| 날짜 | 버전 | 작성자 | 내용 |
|------|------|--------|------|
| 2025-12-18 | 1.0 | Claude Code | disasterHouse V3 API 및 보안 기능 통합 완료 |
| 2025-12-19 | 2.0 | Claude Code | API 엔드포인트 수정, PaymentContract 필드 수정, 에러 UX 개선 |

---

## 📚 관련 서비스 파일 (수정 불필요)

### Context & Hooks
- `src/context/SessionContext.js` - 세션 토큰 관리 컨텍스트
- `src/context/DisasterHouseContext.js` - 보험 계약 데이터 관리
- `src/apps/safety/hooks/useStepGuard.js` - 단계 검증 훅

### Services
- `src/apps/safety/services/consentService.js` - 동의 API 서비스
  - `getSessionToken()` - 세션 토큰 발급
  - `recordConsent()` - 동의 기록
  - `ConsentError` 클래스
  - `getErrorMessage()` - 에러 메시지 변환
  - `isSessionError()` - 세션 에러 확인
- `src/apps/safety/services/businessVerificationService.js` - 사업자검증 서비스
- `src/utils/csrfTokenManager.js` - CSRF 토큰 관리

### Components
- `src/components/auth/DisasterAuth.js` - 본인인증 (NICE) 연동
- `src/components/modals/ErrorModal.js` - 에러 모달
- `src/components/loadings/Loading.js` - 로딩 표시

---

## ✨ 완료 상태

**상태**: ✅ 모든 Phase 완료, v2.0 수정사항 적용
**빌드**: ✅ 성공 (컴파일 에러 없음)
**배포**: ✅ 완료 (`/var/www/safety/disasterHouse/`)
**Git**: ✅ Push 완료 (feature/disaster-house)

---

## 🔗 참고 문서

- **v1.0 문서**: `DEPRECATED_DISASTER_HOUSE_V3_GUIDE_v1.md` (보관용)
- **동의 템플릿 API**: `CONSENT_TEMPLATE_FRONTEND_SPEC.md`
- **disasterSafeguard 가이드**: `DISASTER_SAFEGUARD_INTEGRATION_GUIDE.md`
- **Phase 5.5 통합**: `FRONTEND_INTEGRATION_GUIDE_PHASE_5_5.md`

---

**작성자**: Claude Code
**문의**: 문제 발생 시 Console 에러 로그, Network 탭, sessionStorage 확인
