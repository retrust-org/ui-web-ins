# Retrust Insurance Platform - Frontend

React 기반 보험 플랫폼 프론트엔드

## 프로젝트 구조

```
src/apps/safety/
├── disasterHouse/        # 주택풍수해보험 (17604)
├── disasterSafeguard/    # 재해보장보험 (17605)
└── services/             # 공통 서비스 (consentService, businessVerificationService)
```

## V3 API 통합 완료

### disasterHouse (주택풍수해보험)
- ✅ SessionToken 기반 인증
- ✅ 동의 API 통합 (템플릿 100-300)
- ✅ 본인인증 (NICE)
- ✅ 전자서명 (postMessage)
- ✅ 사업자 검증

### disasterSafeguard (재해보장보험)
- ✅ SessionToken 기반 인증
- ✅ 동의 API 통합
- ✅ 본인인증 (NICE)
- ✅ 전자서명 (postMessage)
- ✅ 사업자 검증 (국세청 연동)

## 빌드 및 배포

```bash
# 개발 서버
npm run start:house        # disasterHouse
npm run start:safeguard    # disasterSafeguard

# 프로덕션 빌드
npm run build:house        # → /var/www/safety/disasterHouse/
npm run build:safeguard    # → /var/www/safety/disasterSafeguard/
```

## 주요 기능

### 이중 토큰 인증
- **CSRF Token**: disaster-api 호출 시
- **Session Token**: sign-api 호출 시 (30분 유효)

### 보안 플로우
1. 보험료 조회 시 SessionToken 발급
2. 동의 API로 동의 기록 (템플릿 100-300)
3. 본인인증 (NICE) → SessionToken 갱신
4. 전자서명 (postMessage)
5. 가계약/결제 (암호화)

## API 엔드포인트

### Sign API
- `GET /sign-api/nice/api/session-token` - 세션 토큰 발급
- `POST /sign-api/api/consent/record` - 동의 기록

### Disaster API
- `POST /disaster-api/api/v3/disaster/premium/provisional` - 가계약
- `POST /disaster-api/api/v3/disaster/contract` - 결제계약
- `POST /disaster-api/api/v3/disaster/business/verify` - 사업자 검증

자세한 내용: `docs/API_REFERENCE.md`

## 문서

- **API 참조**: `docs/API_REFERENCE.md`
- **disasterHouse 가이드**: `docs/DISASTER_HOUSE_V3_INTEGRATION_GUIDE.md`
- **disasterSafeguard 가이드**: `docs/DISASTER_SAFEGUARD_INTEGRATION_GUIDE.md`
- **프론트엔드 가이드**: `docs/FRONTEND_COMPLETE_GUIDE.md`

## 최근 변경사항 (2025-12-19)

### 코드
- API 엔드포인트 수정: `/housing/` 세그먼트 제거
- PaymentContract: `athNo` 제거, `encryptedFields` 필드명 수정
- SignupChkConsent: 동의처리 에러 UX 개선
- 동의처리 에러 시 `/price`로 리다이렉트

### 문서
- 중복/구식 문서 정리 (DEPRECATED, Phase 4/5.5 문서 삭제)
- API_REFERENCE.md 추가
- README.md, CLAUDE.md 최신화

## 개발 환경

- Node.js: 16+
- React: 18.2.0
- React Router: 6.22.3

## 라이센스

Proprietary
