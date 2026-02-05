# API Reference - disasterSafeguard / disasterHouse

**버전**: V3
**최종 업데이트**: 2025-12-19
**변경 이력**: 사업자 검증 API 응답 형식 업데이트 (isValid 필드 추가)

---

## 인증 헤더

모든 V3 API는 다음 헤더를 사용합니다:

| 헤더 | 설명 | 필수 | 예시 |
|------|------|------|------|
| `X-CSRF-Token` | CSRF 보호 토큰 | ✅ | `abc123def...` |
| `X-Session-Token` | 세션 인증 토큰 (30분 유효) | ✅ | `eyJhbGc...` |
| `Content-Type` | 요청 본문 타입 | ✅ | `application/json` |

---

## 엔드포인트 목록

### 1. Session & Auth

#### GET `/sign-api/nice/api/session-token`
세션 토큰 발급

**Query Parameters**:
- `purpose`: signup
- `client_id`: mrz_disaster

**Response**:
```json
{
  "sessionToken": "eyJhbGc...",
  "expiresAt": "2025-12-19T10:30:00Z"
}
```

#### POST `/sign-api/api/consent/record`
동의 기록 저장

**Headers**:
- `X-Session-Token`: required

**Body**:
```json
{
  "templateId": 100,
  "consentVersion": "1.0",
  "isAgreed": true
}
```

---

### 2. Disaster API - disasterHouse

#### POST `/disaster-api/api/v3/disaster/premium`
보험료 조회

**Headers**:
- `X-CSRF-Token`: required

**Body**:
```json
{
  "pdCd": "17604",
  "inspeStrtDt": "20251201",
  "inspeEndDt": "20261130",
  "buildingArea": 100,
  "buildingType": "A",
  "regionCode": "1100"
}
```

**Response**:
```json
{
  "success": true,
  "tranId": "RETRUST202512190001",
  "data": {
    "aplPrem": 50000
  }
}
```

#### POST `/disaster-api/api/v3/disaster/premium/provisional`
가계약 생성

**Headers**:
- `X-CSRF-Token`: required
- `X-Session-Token`: required

**Body**:
```json
{
  "pdCd": "17604",
  "polhdNm": "홍길동",
  "inspeStrtDt": "20251201",
  "inspeEndDt": "20261130",
  "encryptedFields": {
    "encryptedKey": "...",
    "encryptedData": "..."
  }
}
```

**Response**:
```json
{
  "success": true,
  "tranId": "RETRUST202512190001",
  "data": {
    "prctrNo": "PRE20251219001"
  }
}
```

#### POST `/disaster-api/api/v3/disaster/contract`
결제 및 계약 체결

**Headers**:
- `X-CSRF-Token`: required
- `X-Session-Token`: required

**Body**:
```json
{
  "ctrCcluYn": "1",
  "pdCd": "17604",
  "prctrNo": "PRE20251219001",
  "rcptPrem": "50000",
  "pyrcShDtlCd": "104",
  "dporNm": "홍길동",
  "encryptedFields": {
    "encryptedKey": "...",
    "encryptedData": "..."
  },
  "efctPrd": "2512"
}
```

**Response**:
```json
{
  "success": true,
  "tranId": "RETRUST202512190001",
  "data": {
    "polNo": "POL20251219001"
  }
}
```

---

### 3. Disaster API - disasterSafeguard

#### POST `/disaster-api/api/v3/disaster/safeguard/premium`
재해보장 보험료 조회

**Headers**:
- `X-CSRF-Token`: required

**Body**:
```json
{
  "pdCd": "17605",
  "bizNo": "1234567890",
  "employees": 10,
  "inspeStrtDt": "20251201",
  "inspeEndDt": "20261130"
}
```

#### POST `/disaster-api/api/v3/disaster/safeguard/premium/provisional`
재해보장 가계약 생성

**Headers**:
- `X-CSRF-Token`: required
- `X-Session-Token`: required

#### POST `/disaster-api/api/v3/disaster/safeguard/contract`
재해보장 계약 체결

**Headers**:
- `X-CSRF-Token`: required
- `X-Session-Token`: required

---

### 4. Business Verification

#### POST `/disaster-api/api/v3/disaster/business/verify`
사업자번호 검증 (국세청 연동)

**Headers**:
- `X-CSRF-Token`: required

**Body**:
```json
{
  "businessNumber": "1234567890",
  "businessName": "테스트상호"
}
```

**Response (정상 사업자)**:
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

**Response (비정상 사업자)**:
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

**Response (휴폐업 - 레거시 형식)**:
```json
{
  "success": false,
  "data": {
    "errCd": "70020",
    "errMsg": "휴업 또는 폐업 중인 사업자입니다."
  }
}
```

**중요**: `success: true`이지만 `data.isValid: false`인 케이스를 반드시 체크해야 합니다.

---

## 에러 코드

### Session 관련

| 코드 | 메시지 | 처리 방법 |
|------|--------|----------|
| `SESSION_EXPIRED` | 세션 만료 | /price로 리다이렉트, 세션 재발급 |
| `SESSION_BLOCKED` | 세션 차단 | /price로 리다이렉트 |
| `SESSION_INVALID` | 유효하지 않은 세션 | /price로 리다이렉트 |
| `MISSING_SESSION_TOKEN` | 세션 토큰 없음 | /price로 리다이렉트 |

### Business Verification

| 코드 | 메시지 |
|------|--------|
| `70020` | 휴업/폐업 중인 사업자 |
| `70021` | 등록되지 않은 사업자번호 |
| `70022` | 사업자번호와 상호명 불일치 |

### Meritz API

| 코드 | 메시지 |
|------|--------|
| `53012` | 필수 입력 항목 누락 |
| `53015` | 입력 값 형식 오류 |
| `69999` | 시스템 오류 |

---

## 암호화 필드

### 가계약 (Provisional)

암호화 대상:
- `polhdRsidNo`: 계약자 주민번호
- `inspeRsidNo`: 피보험자 주민번호
- `polhdEmailAdrVal`: 이메일
- `polhdCellNo`: 연락처

### 결제 (Contract)

암호화 대상 (카드):
- `crdNo`: 카드번호 (16자리)
- `cardValidTerm`: 유효기간 (YYMM)
- `instlmCnt`: 할부개월
- `cardPwd`: 카드 비밀번호 (앞 2자리)
- `dporCd`: 생년월일 (6자리)

암호화 대상 (계좌):
- `acntNo`: 계좌번호
- `dporCd`: 생년월일 (6자리)

---

## 환경별 Base URL

| 환경 | Base URL |
|------|----------|
| **개발** | `http://localhost:38101` |
| **프로덕션** | `https://retrust.world` |

---

## 참고 문서

- **disasterHouse 구현**: `DISASTER_HOUSE_V3_INTEGRATION_GUIDE.md`
- **disasterSafeguard 구현**: `DISASTER_SAFEGUARD_INTEGRATION_GUIDE.md`
- **프론트엔드 가이드**: `FRONTEND_COMPLETE_GUIDE.md`
