# 재해보장(disasterSafeguard) 통합 가이드

## 1. 개요

### 목적
이 문서는 `disasterSafeguard` (실손보상 소상공인 풍수해·지진재해보험) 가입 플로우의 전체 아키텍처와 V3 API 통합 방식을 설명합니다.

### 아키텍처 개요
```
┌─────────────────────────────────────────────────────────────┐
│                    React 프론트엔드                           │
│  ┌─────────────────────┐    ┌──────────────────────┐        │
│  │  SessionContext     │    │   CSRF Manager       │        │
│  │  (세션 토큰 관리)    │    │   (CSRF 토큰 관리)    │        │
│  └─────────────────────┘    └──────────────────────┘        │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              DisasterInsuranceContext                 │   │
│  │         (보험 계약 데이터, 사용자 정보 관리)            │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                      백엔드 API                               │
│  ┌──────────────────┐  ┌──────────────────┐                │
│  │   Sign API       │  │  Disaster API    │                │
│  │ (동의 기록, 인증) │  │ (보험료, 계약)   │                │
│  │  X-Session-Token │  │  X-CSRF-Token    │                │
│  └──────────────────┘  └──────────────────┘                │
│                                                               │
│  ┌───────────────────────────────────────┐                  │
│  │       전자서명 서버 (retrust.world)    │                  │
│  │       postMessage 통신                 │                  │
│  └───────────────────────────────────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 보안 메커니즘

### 2.1 두 가지 인증 토큰

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
  - **최초 발급**: `selectedprice/index.js`에서 보험료 조회 시
  - **갱신**: `SignupChkConsent.js`에서 본인인증 성공 시
- **특징**:
  - 30분 유효 (서버 설정)
  - 본인인증 전: `authenticated: false`
  - 본인인증 후: `authenticated: true` (갱신된 토큰 저장)
  - 만료 시 `/price`로 리다이렉트

### 2.2 토큰 사용 구분

| API 종류 | 헤더 | 토큰 관리 | 사용 페이지 |
|---------|------|----------|------------|
| Sign API | X-Session-Token | SessionContext | selectedprice, 모든 동의 페이지, 본인인증 |
| Disaster API | X-CSRF-Token | csrfManager | selectedprice (보험료 조회), confirm (가계약), pay (결제) |

---

## 3. API 연동

### 3.1 Session Token 발급 (getSessionToken)

**파일**: `src/apps/safety/services/consentService.js`

```javascript
export const getSessionToken = async (purpose, clientId) => {
  const response = await axios.post('/sign-api/v1/session/token', {
    purpose,      // 'signup'
    clientId      // 'mrz_disaster'
  });

  return {
    sessionToken: response.data.token,
    expiresAt: response.data.expiresAt
  };
};
```

**호출 시점**:
- `selectedprice/index.js` - 보험료 조회 버튼 클릭 시 (`handleConfirmClick`)

**에러 처리**:
- sessionToken 발급 실패해도 보험료 조회는 계속 진행
- 동의 페이지에서 sessionToken이 없으면 에러 모달 표시

---

### 3.2 동의 기록 API (recordConsent)

**파일**: `src/apps/safety/services/consentService.js`

```javascript
export const recordConsent = async (sessionToken, consentData) => {
  const response = await axios.post(
    '/sign-api/v1/consent/record',
    {
      templateId: consentData.templateId,
      consentVersion: consentData.consentVersion,
      isAgreed: consentData.isAgreed
    },
    {
      headers: {
        'X-Session-Token': sessionToken
      }
    }
  );

  return response.data;
};
```

**호출 시점**:
- 사용자가 동의 체크박스를 클릭할 때마다
- 각 동의 항목마다 개별 API 호출
- 동의일 경우만 API 호출 (미동의는 로컬 상태만 변경)

**에러 처리**:
- API 실패 시 체크박스 상태 변경 안 함
- `ConsentError` 클래스로 에러 타입 구분
- `getErrorMessage(code, reason)`로 사용자 친화적 메시지 표시

---

### 3.3 Premium API (보험료 조회)

**파일**: `selectedprice/index.js`

```javascript
const handleFetchPremium = async () => {
  const response = await axios.post(
    '/disaster-api/v3/premium',
    premiumRequestData,
    {
      headers: await csrfManager.getHeaders()  // X-CSRF-Token 자동 추가
    }
  );
  // ...
};
```

**특징**:
- sessionToken 불필요 (CSRF 토큰만 사용)
- csrfManager가 자동으로 토큰 재시도 처리

---

### 3.4 Provisional Contract API (가계약)

**파일**: `confirm/index.js`

- 가계약 생성 시 X-CSRF-Token 사용
- 전자서명 URL 반환 (`rltLinkUrl1`, `rltLinkUrl2`)

---

### 3.5 Payment API (결제)

**파일**: `pay/index.js`

- 결제 처리 시 X-CSRF-Token 사용
- PG사 연동 후 결제 완료 처리

---

## 4. 동의 템플릿 ID 매핑

### 4.1 템플릿 ID 전체 목록

| Template ID | 페이지 | 카테고리 | 동의 항목 |
|-------------|--------|----------|-----------|
| **100** | LimitsAnnounce | 초과가입 제한 | 초과 및 중복가입 제한 안내 |
| **101** | ConsentAgreement | 수집·이용 | 고유식별정보 |
| **102** | ConsentAgreement | 수집·이용 | 민감정보 |
| **103** | ConsentAgreement | 수집·이용 | 개인신용정보 |
| **104** | ConsentAgreement | 제공 | 고유식별정보 |
| **105** | ConsentAgreement | 제공 | 민감정보 |
| **106** | ConsentAgreement | 제공 | 개인신용정보 |
| **107** | ConsentAgreement | 조회 | 고유식별정보 |
| **108** | ConsentAgreement | 조회 | 민감정보 |
| **109** | ConsentAgreement | 조회 | 개인신용정보 |
| **201** | PersonalInfoConsent | 수집·이용 | 고유식별정보 (상세) |
| **202** | PersonalInfoConsent | 수집·이용 | 민감정보 (상세) |
| **203** | PersonalInfoConsent | 수집·이용 | 개인신용정보 (상세) |
| **204** | PersonalInfoConsent | 제공 | 고유식별정보 (상세) |
| **205** | PersonalInfoConsent | 제공 | 민감정보 (상세) |
| **206** | PersonalInfoConsent | 제공 | 개인신용정보 (상세) |
| **207** | PersonalInfoConsent | 조회 | 고유식별정보 (상세) |
| **208** | PersonalInfoConsent | 조회 | 민감정보 (상세) |
| **209** | PersonalInfoConsent | 조회 | 개인신용정보 (상세) |
| **300** | SignupChkConsent | 가입 전 확인 | 가입 전 확인사항 동의 |

### 4.2 파일별 템플릿 ID 매핑

#### LimitsAnnounce.js
```javascript
const TEMPLATE_ID = 100;  // 초과가입 제한 안내
```

#### ConsentAgreement.js
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

#### PersonalInfoConsent.js
```javascript
const TEMPLATE_IDS = {
  0: 201, // 수집이용 - 고유식별정보
  1: 202, // 수집이용 - 민감정보
  2: 203, // 수집이용 - 개인신용정보
  3: 204, // 제공 - 고유식별정보
  4: 205, // 제공 - 민감정보
  5: 206, // 제공 - 개인신용정보
  6: 207, // 조회 - 고유식별정보
  7: 208, // 조회 - 민감정보
  8: 209, // 조회 - 개인신용정보
};
```

#### SignupChkConsent.js
```javascript
const TEMPLATE_ID = 300;  // 가입 전 확인사항
```

---

## 5. 전자서명 연동

### 5.1 전자서명 플로우

**파일**: `document/index.js`

```
1. 가계약 생성 → 전자서명 URL 발급 (rltLinkUrl1, rltLinkUrl2)
2. 팝업 창 오픈 → sessionToken을 쿼리 파라미터로 전달
3. 전자서명 완료 → postMessage로 SIGNATURE_COMPLETE 이벤트 수신
4. 두 서명 모두 완료 → 다음 버튼 활성화
```

### 5.2 postMessage 이벤트 수신

```javascript
useEffect(() => {
  const handleMessage = (event) => {
    // Origin 검증 (retrust.world만 허용)
    if (!event.origin.includes('retrust.world')) return;

    if (!event.data || typeof event.data !== 'object') return;

    const { type, documentType, redirectTo } = event.data;

    // 서명 완료 이벤트
    if (type === 'SIGNATURE_COMPLETE') {
      if (documentType === 'product_guide' && !isSigned1) {
        setIsSigned1(true);  // 상품안내서 서명 완료
      } else if (documentType === 'subscription' && !isSigned2) {
        setIsSigned2(true);  // 청약서 서명 완료
      }
    }

    // 세션 만료 이벤트
    if (type === 'SESSION_EXPIRED') {
      clearSession();
      navigate(redirectTo || '/price');
    }
  };

  window.addEventListener('message', handleMessage);
  return () => window.removeEventListener('message', handleMessage);
}, [isSigned1, isSigned2, clearSession, navigate]);
```

### 5.3 전자서명 팝업 오픈

```javascript
const handleOpenDoc1 = () => {
  if (contractData.rltLinkUrl1 && sessionToken) {
    const url = `${contractData.rltLinkUrl1}?sessionToken=${encodeURIComponent(sessionToken)}`;
    window.open(url, 'signaturePopup1', 'width=900,height=700');
  }
};

const handleOpenDoc2 = () => {
  if (contractData.rltLinkUrl2 && sessionToken) {
    const url = `${contractData.rltLinkUrl2}?sessionToken=${encodeURIComponent(sessionToken)}`;
    window.open(url, 'signaturePopup2', 'width=900,height=700');
  }
};
```

### 5.4 다음 버튼 활성화 조건

```javascript
const isNextButtonDisabled = !isSigned1 || !isSigned2;
```

---

## 6. 전체 사용자 플로우

### 6.1 페이지 순서

```
1. main (메인 페이지)
   ↓
2. address (주소 검색)
   ↓
3. result (건축물대장 조회 결과)
   ↓
4. workPlaceinfo (사업장 정보 입력)
   ↓
5. insuranceDate (보험 기간 설정)
   ↓
6. price (보험료 조회)
   - sessionToken 발급 (getSessionToken)
   - 보험료 조회 (Premium API)
   ↓
7. limitAnnounce (초과가입 제한 안내)
   - recordConsent(100)
   ↓
8. agreement (개인정보 처리 동의서)
   - recordConsent(101-109) × 9회
   ↓
9. personalInfoConsent (상세 개인정보 동의서)
   - recordConsent(201-209) × 9회
   ↓
10. signupChkConsent (가입 전 확인사항 + 본인인증)
    - recordConsent(300)
    - 본인인증 성공 시 sessionToken 갱신
    ↓
11. userInfo (계약자 정보 입력)
    ↓
12. confirm (청약 내용 확인)
    - 가계약 생성 (Provisional Contract API)
    ↓
13. document (전자서명)
    - postMessage로 서명 완료 이벤트 수신
    ↓
14. pay (결제)
    - Payment API 호출
    ↓
15. complete (가입 완료)
```

### 6.2 단계 검증 (Removed)

**중요: disasterSafeguard는 useStepGuard를 사용하지 않습니다.**

disasterHouse와 동일하게 Context 기반 데이터 관리만 사용하며, 단계 검증 로직은 제거되었습니다:
- ✅ Context 기반 데이터 저장 및 복원
- ✅ 단순 `navigate()`로 페이지 이동
- ✅ 각 페이지에서 필요 데이터 자체 검증
- ❌ useStepGuard 사용 안 함
- ❌ sessionStorage 기반 단계 완료 체크 안 함

**변경 이력 (2025-12-19)**:
- `insuranceDate/index.js`: useStepGuard 제거
- `address/ResultDisplay.js`: useStepGuard 제거
- `workplace/Question.js`: useStepGuard 제거
- `address/index.js`: useStepGuard 제거
- `components/AgreeModal.js`: useStepGuard 제거

---

## 7. 에러 처리

### 7.1 SESSION_EXPIRED 에러

**발생 시점**:
- sessionToken 만료 (30분 경과)
- sessionToken이 서버에서 무효화됨

**처리 방법**:
```javascript
if (type === 'SESSION_EXPIRED') {
  clearSession();  // SessionContext에서 토큰 제거
  navigate(redirectTo || '/price');  // 보험료 조회 페이지로 리다이렉트
}
```

**사용자 메시지** (reason별):
- `TOKEN_EXPIRED`: "세션이 만료되었습니다. 다시 진행해 주세요."
- `TOKEN_NOT_FOUND`: "세션 정보가 없습니다. 보험료 조회부터 다시 진행해 주세요."
- `INVALID_TOKEN`: "유효하지 않은 세션입니다. 다시 진행해 주세요."

### 7.2 ConsentError (동의 기록 실패)

**파일**: `src/apps/safety/services/consentService.js`

```javascript
export class ConsentError extends Error {
  constructor(message, code, reason) {
    super(message);
    this.name = 'ConsentError';
    this.code = code;
    this.reason = reason;
  }
}

export const getErrorMessage = (code, reason) => {
  if (code === 'SESSION_EXPIRED') {
    switch (reason) {
      case 'TOKEN_EXPIRED':
        return '세션이 만료되었습니다. 보험료 조회부터 다시 진행해 주세요.';
      case 'TOKEN_NOT_FOUND':
        return '세션 정보가 없습니다. 보험료 조회부터 다시 진행해 주세요.';
      case 'INVALID_TOKEN':
        return '유효하지 않은 세션입니다. 보험료 조회부터 다시 진행해 주세요.';
      default:
        return '세션 오류가 발생했습니다. 보험료 조회부터 다시 진행해 주세요.';
    }
  }
  return '동의 기록 저장에 실패했습니다. 다시 시도해 주세요.';
};
```

### 7.3 CSRF 토큰 오류

**csrfManager의 자동 재시도**:
```javascript
// csrfManager가 내부적으로 처리
1. API 호출 실패 시 토큰 재발급
2. 재발급된 토큰으로 API 재시도
3. 재시도도 실패 시 에러 throw
```

### 7.4 사업자번호 검증 에러

**파일**: `src/apps/safety/services/businessVerificationService.js`

**API 응답 형식**:

**정상 사업자**:
```json
{
  "success": true,
  "data": {
    "businessNumber": "6068189724",
    "businessName": "테스트",
    "isValid": true,
    "status": "active",
    "message": "정상 영업 중인 사업자입니다",
    "fromCache": true,
    "cachedAt": "2025-12-19T02:48:19.000Z"
  }
}
```

**비정상 사업자**:
```json
{
  "success": true,
  "data": {
    "businessNumber": "6060001234",
    "businessName": "테스트",
    "isValid": false,
    "status": "unknown",
    "message": "사업자 정보를 확인할 수 없습니다",
    "fromCache": true,
    "cachedAt": "2025-12-19T03:08:06.000Z"
  }
}
```

**검증 로직** (`checkVerificationResult` 함수):
```javascript
export const checkVerificationResult = (response) => {
    // 1. success 필드가 false이면 검증 실패
    if (response.success === false) {
        return {
            isValid: false,
            errorCode: response.data?.errCd,
            errorMessage: response.data?.errMsg || '사업자번호 검증에 실패했습니다.'
        };
    }

    // 2. data.isValid가 false이면 검증 실패 (중요!)
    if (response.data?.isValid === false) {
        return {
            isValid: false,
            errorCode: response.data?.status,
            errorMessage: response.data?.message || '사업자번호 검증에 실패했습니다.'
        };
    }

    // 3. errCd가 "00001"이 아니면 검증 실패
    if (response.data?.errCd && response.data.errCd !== "00001") {
        return {
            isValid: false,
            errorCode: response.data.errCd,
            errorMessage: response.data.errMsg || '사업자번호 검증에 실패했습니다.'
        };
    }

    // 검증 성공
    return {
        isValid: true,
        errorCode: null,
        errorMessage: null
    };
};
```

**에러 코드별 메시지**:
| 에러 코드 | 메시지 |
|----------|--------|
| `70020` | 휴업 또는 폐업 중인 사업자입니다 |
| `70021` | 등록되지 않은 사업자번호입니다 |
| `70022` | 사업자번호와 상호명이 일치하지 않습니다 |
| `unknown` | 사업자 정보를 확인할 수 없습니다 |

**중요**: `data.isValid === false` 체크가 반드시 필요합니다. `success: true`이지만 `isValid: false`인 경우가 존재하기 때문입니다.

---

## 8. disasterHouse 적용 가이드 (향후 작업)

### 8.1 적용 대상 파일

disasterSafeguard에서 복구한 로직을 disasterHouse에도 동일하게 적용해야 합니다:

1. **document/index.js**
   - 전자서명 로직 (postMessage, sessionToken)

2. **selectedprice/index.js**
   - sessionToken 발급 로직

3. **LimitsAnnounce.js**
   - recordConsent API (템플릿 ID: 100)

4. **ConsentAgreement.js**
   - recordConsent API (템플릿 ID: 101-109)

5. **PersonalInfoConsent.js**
   - recordConsent API (템플릿 ID: 201-209)

6. **SignupChkConsent.js**
   - recordConsent API (템플릿 ID: 300)
   - sessionToken 갱신 로직

### 8.2 적용 시 주의사항

**타이틀 텍스트**:
- disasterSafeguard: "실손보상 소상공인 풍수해·지진재해보험"
- disasterHouse: "실손보상 주택 풍수해·지진재해보험"

**useStepGuard**:
- ~~disasterSafeguard와 disasterHouse 모두 useStepGuard를 사용하지 않습니다 (2025-12-19 제거됨)~~
- Context 기반 데이터 관리로 통일

**API 엔드포인트**:
- 동일한 V3 API 사용 (`/sign-api/v1/`, `/disaster-api/v3/`)
- 템플릿 ID도 동일하게 사용 가능 (100, 101-109, 201-209, 300)

**SessionContext 공유**:
- disasterSafeguard와 disasterHouse는 별도의 SessionContext를 사용하므로, 각각 독립적으로 sessionToken 관리

### 8.3 병합 방법

disasterSafeguard에서 사용한 동일한 병합 전략 적용:

```bash
# 1. feature/nft-server-integration에서 파일 추출
git show feature/nft-server-integration:src/apps/safety/disasterHouse/[파일경로] > /tmp/house_file.js

# 2. DisasterHeader 유지 (SafetyHeader로 교체하지 않음)
# 3. 타이틀 텍스트: "실손보상 주택" 유지
# 4. useStepGuard 로직 추가 (bash script 사용)
# 5. 복사
cp /tmp/house_file.js src/apps/safety/disasterHouse/[파일경로]
```

---

## 9. 참고 자료

### 9.1 관련 파일 위치

#### 서비스 파일
- `src/apps/safety/services/consentService.js` - 동의 API 서비스
- `src/apps/safety/services/businessVerificationService.js` - 사업자 검증 API 서비스
- ~~`src/apps/safety/hooks/useStepGuard.js` - 단계 검증 훅 (더 이상 사용하지 않음)~~

#### Context
- `src/context/SessionContext.js` - 세션 토큰 관리
- `src/context/DisasterInsuranceContext.js` - 보험 계약 데이터 관리

#### 동의 페이지
- `src/apps/safety/disasterSafeguard/consentform/LimitsAnnounce.js`
- `src/apps/safety/disasterSafeguard/consentform/ConsentAgreement.js`
- `src/apps/safety/disasterSafeguard/consentform/PersonalInfoConsent.js`
- `src/apps/safety/disasterSafeguard/consentform/SignupChkConsent.js`

#### 전자서명
- `src/apps/safety/disasterSafeguard/document/index.js`

### 9.2 Git 브랜치 참조

```bash
# 원본 API 통합 코드 (feature/nft-server-integration)
git show feature/nft-server-integration:src/apps/safety/disasterSafeguard/[파일경로]

# 최신 HEAD 버전
git show HEAD:src/apps/safety/disasterSafeguard/[파일경로]
```

### 9.3 테스트 체크리스트

- [ ] 보험료 조회 시 sessionToken 발급 확인 (콘솔 로그)
- [ ] 초과가입 제한 안내 동의 시 recordConsent(100) API 호출 확인
- [ ] 개인정보 처리 동의서 각 항목 동의 시 recordConsent(101-109) API 호출 확인
- [ ] 상세 개인정보 동의서 각 항목 동의 시 recordConsent(201-209) API 호출 확인
- [ ] 가입 전 확인사항 동의 시 recordConsent(300) API 호출 확인
- [ ] 본인인증 성공 시 sessionToken 갱신 확인 (콘솔 로그)
- [ ] 전자서명 완료 시 postMessage 이벤트 수신 확인
- [ ] 전자서명 두 개 모두 완료 후 다음 버튼 활성화 확인
- [ ] sessionToken 만료 시 /price로 리다이렉트 확인
- [ ] **사업자번호 검증 시 `isValid: false` 응답에 에러 모달 표시 확인**
- [ ] **사업자번호 검증 실패 시 다음 페이지로 이동 차단 확인**

---

## 10. 변경 이력

### 2025-12-19: useStepGuard 제거 및 사업자 검증 개선

**변경 사항**:
1. **useStepGuard 제거**
   - disasterHouse와 동일하게 단계 검증 로직 제거
   - Context 기반 데이터 관리로 통일
   - 영향받은 파일 (5개):
     - `insuranceDate/index.js`
     - `address/ResultDisplay.js`
     - `workplace/Question.js`
     - `address/index.js`
     - `components/AgreeModal.js`

2. **사업자 검증 로직 개선**
   - `businessVerificationService.js`의 `checkVerificationResult` 함수 수정
   - `data.isValid === false` 체크 로직 추가
   - `success: true`이지만 `isValid: false`인 케이스 처리
   - 에러 메시지: `data.message` 필드 사용

**배경**:
- workPlaceInfo 페이지에서 "다음으로" 버튼 클릭 시 "사업장정보를 먼저 입력해주세요" 에러 발생
- 사업자번호 검증 실패 시 에러 모달이 표시되지 않는 문제
- disasterHouse와 동일한 패턴으로 통일

**해결**:
- ✅ 단계 검증 없이 Context 데이터만으로 플로우 진행
- ✅ 사업자번호 검증 실패 시 에러 모달 정상 표시
- ✅ 검증 실패 시 다음 페이지 이동 차단

---

**문서 버전**: 2.0
**최종 수정일**: 2025-12-19
**작성자**: Claude Code Assistant
