# 인슈어트러스트 플랫폼 - 멀티 앱 아키텍처 분석

## 프로젝트 개요

이 프로젝트는 **React 기반의 멀티 앱 아키텍처**를 사용하는 보험 플랫폼입니다. `REACT_APP_TYPE` 환경변수를 통해 하나의 코드베이스에서 다양한 보험 서비스 앱을 개별적으로 빌드하고 배포할 수 있는 구조입니다.

## 멀티 앱 아키텍처 구조

### 앱 타입별 진입점 시스템

프로젝트는 `craco.config.js`와 `appEntryFactory.js`를 통해 **REACT_APP_TYPE** 환경변수에 따라 다른 앱을 실행합니다:

#### 지원되는 앱 타입들:
- **HOME**: 메인 홈페이지 (`index-home.js`)
- **CLAIM**: 보험 청구 시스템 (`index-claim.js`)
- **OVERSEAS**: 해외여행보험 (`index-overseas.js`)
- **DEPARTED**: 출국후 여행보험 (`index-departed.js`)
- **LONGTERM**: 장기체류보험 (`index-longterm.js`)
- **DOMESTIC**: 국내여행보험 (`index-domestic.js`)
- **PARTNER**: 파트너 페이지 (`index-partner.js`)
- **SAFETY**: 안전보험 (`index-safety.js`)
- **DISASTER**: 재해보험 (`index-disaster.js`)
- **FIRE**: 화재보험 (`index-fire.js`)
- **CERTIFICATE**: 증서 페이지 (`index-certificate.js`)

### 진입점 결정 로직

`craco.config.js`에서 환경변수에 따라 다른 진입점을 설정:

```javascript
const appType = process.env.REACT_APP_TYPE;

if (appType === "CLAIM") {
  webpackConfig.entry = paths.appSrc + "/index-claim.js";
} else if (appType === "OVERSEAS") {
  webpackConfig.entry = paths.appSrc + "/index-overseas.js";
}
// ... 기타 앱 타입들
```

## 패키지 스크립트 명령어

### 개발 서버 실행
```bash
# 개별 앱 개발 서버 실행
npm run start:claim      # 보험 청구 앱
npm run start:overseas   # 해외여행보험 앱
npm run start:departed   # 출국후 여행보험 앱
npm run start:trip       # 여행보험 메인 앱
npm run start:partner    # 파트너 앱
npm run start:safety     # 안전보험 앱
npm run start:disaster   # 재해보험 앱
npm run start:safeguard  # 재해보장 앱
npm run start:house      # 주택재해 앱
npm run start:governance # 관리재해 앱
npm run start:fire       # 화재보험 앱
npm run start:longterm   # 장기체류보험 앱
npm run start:domestic   # 국내여행보험 앱
npm run start:home       # 홈페이지 앱
npm run start:certificate # 증서 앱
```

### 빌드 및 배포 시스템

각 앱은 독립적으로 `/var/www/` 디렉토리의 해당 경로에 배포됩니다:

```bash
# 개별 앱 빌드 및 배포
npm run build:claim      # → /var/www/claim/
npm run build:overseas   # → /var/www/trip/overseas/
npm run build:departed   # → /var/www/trip/departed/
npm run build:longterm   # → /var/www/trip/longterm/
npm run build:domestic   # → /var/www/trip/domestic/
npm run build:partner    # → /var/www/partner/
npm run build:home       # → /var/www/home/
npm run build:safety     # → /var/www/safety/
npm run build:safeguard  # → /var/www/safety/disasterSafeguard/
npm run build:house      # → /var/www/safety/disasterHouse/
npm run build:governance # → /var/www/safety/disasterGovernance/
npm run build:fire       # → /var/www/safety/fire/
npm run build:certificate # → /var/www/certificate/

# 전체 앱 빌드
npm run build:all        # 모든 앱을 순차적으로 빌드
npm run build:trip       # 여행보험 관련 모든 앱 빌드
```

### 빌드 프로세스 특징

1. **메모리 최적화**: `NODE_OPTIONS=--max_old_space_size=4096`으로 메모리 할당
2. **소스맵 비활성화**: `GENERATE_SOURCEMAP=false`로 빌드 크기 최적화
3. **자동 배포**: 빌드 성공 시 자동으로 `/var/www/` 해당 디렉토리에 복사
4. **에러 처리**: 빌드 실패 시 파일 복사를 중단하고 에러 반환

## 기술 스택 및 의존성

### 주요 라이브러리
- **React 18.2.0**: 메인 프레임워크
- **React Router DOM 6.22.3**: 라우팅
- **Redux Toolkit**: 상태 관리
- **Material-UI & Emotion**: UI 컴포넌트 및 스타일링
- **TailwindCSS**: 유틸리티 CSS 프레임워크
- **Axios**: HTTP 클라이언트
- **React Query**: 서버 상태 관리

### 특화 라이브러리
- **@react-pdf/renderer**: PDF 생성
- **jspdf & jspdf-autotable**: PDF 문서 생성
- **qrcode.react**: QR 코드 생성
- **react-slick**: 캐러셀/슬라이더
- **xlsx**: Excel 파일 처리
- **crypto-js & jsencrypt**: 암호화
- **dayjs & moment**: 날짜 처리

### 개발 도구
- **@craco/craco**: Create React App 설정 오버라이드
- **cross-env**: 크로스 플랫폼 환경변수 설정

## 앱 진입점 팩토리 시스템

`appEntryFactory.js`는 모든 앱의 공통 초기화 로직을 담당합니다:

### 주요 기능:
1. **GTM(Google Tag Manager) 초기화**
2. **Redux Store 제공**
3. **파트너 컨텍스트 관리**
4. **재주문 데이터 관리**
5. **상품 정보 캐싱 시스템**
6. **앱 타입별 데이터 정리**

### 파트너 시스템 지원
B2B 파트너를 위한 동적 경로 처리:
- `b2b.retrust.world/{파트너코드}/overseas` 형태 지원
- 파트너별 브랜딩 및 설정 적용

## SEO 및 빌드 최적화

### SEO 설정 (`scripts/seo-config.js`)
각 앱별로 맞춤화된 메타데이터:
- 타이틀, 설명, 키워드
- JSON-LD 구조화 데이터
- Open Graph 태그

### 빌드 최적화 (`scripts/build-seo.js`)
- HTML 템플릿에 SEO 메타데이터 자동 삽입
- PUBLIC_URL 동적 치환
- 앱별 맞춤 HTML 생성

## 파일 구조

```
src/
├── apps/                    # 각 앱별 컴포넌트
│   ├── home/               # 홈페이지 앱
│   ├── claim/              # 보험 청구 앱
│   ├── trip/               # 여행보험 관련 앱들
│   │   ├── overseas/       # 해외여행보험
│   │   ├── departed/       # 출국후 여행보험
│   │   ├── longterm/       # 장기체류보험
│   │   └── domestic/       # 국내여행보험
│   ├── partner/            # 파트너 앱
│   └── safety/             # 안전보험 관련 앱들
├── components/             # 공통 컴포넌트
├── config/                 # 설정 파일들
├── context/                # React 컨텍스트
├── hooks/                  # 커스텀 훅
├── redux/                  # Redux 스토어 설정
├── utils/                  # 유틸리티 함수들
├── css/                    # CSS 모듈 파일들
├── data/                   # 정적 데이터 파일들
├── appEntryFactory.js      # 앱 진입점 팩토리
└── index-{앱명}.js         # 각 앱별 진입점
```

## 배포 시스템

### 디렉토리 구조
```
/var/www/
├── home/                   # 홈페이지
├── claim/                  # 보험 청구
├── partner/                # 파트너 페이지  
├── certificate/            # 증서 페이지
├── trip/                   # 여행보험 관련
│   ├── overseas/           # 해외여행보험
│   ├── departed/           # 출국후 여행보험
│   ├── longterm/           # 장기체류보험
│   └── domestic/           # 국내여행보험
└── safety/                 # 안전보험 관련
    ├── disaster/           # 재해보험
    ├── disasterSafeguard/  # 재해보장
    ├── disasterHouse/      # 주택재해
    ├── disasterGovernance/ # 관리재해
    └── fire/               # 화재보험
```

## 개발 규칙 및 컨벤션

현재 프로젝트에는 명시적인 개발 규칙 파일(`.cursorrules`, `copilot-instructions.md`)이 없지만, 코드 구조를 통해 다음과 같은 패턴을 확인할 수 있습니다:

1. **CSS 모듈 사용**: 각 컴포넌트별 스타일 격리
2. **컨텍스트 패턴**: 앱별 상태 관리를 위한 React Context 활용
3. **Hook 기반 로직**: 재사용 가능한 로직을 커스텀 훅으로 분리
4. **팩토리 패턴**: 공통 초기화 로직의 중앙화
5. **환경변수 기반 설정**: 앱 타입별 동적 설정

## 주요 특징

1. **단일 코드베이스, 다중 앱**: 하나의 리포지토리에서 여러 독립적인 앱 관리
2. **독립적 배포**: 각 앱을 개별적으로 빌드 및 배포 가능
3. **공통 컴포넌트 재사용**: UI 컴포넌트와 비즈니스 로직의 효율적 재사용
4. **파트너 시스템**: B2B 파트너를 위한 화이트라벨 솔루션 지원
5. **SEO 최적화**: 각 앱별 맞춤화된 SEO 메타데이터
6. **상태 관리**: Redux Toolkit을 통한 중앙화된 상태 관리
7. **캐싱 시스템**: 상품 정보 및 사용자 데이터의 효율적 캐싱

이 아키텍처는 **마이크로 프론트엔드** 개념을 단일 리포지토리 내에서 구현한 것으로, 각 보험 상품별로 독립적인 앱을 제공하면서도 공통 로직과 컴포넌트를 효율적으로 공유할 수 있는 구조입니다.

## 에러 대응 원칙

1. **에러 발생 시 원인을 가정하지 말 것**
2. **먼저 실제 시스템/서버 상태를 테스트로 확인**
3. **외부 서버(다른 IP)의 상태는 절대 추측하지 말 것**
4. **코드 수정이 필요하다고 판단되면:**
   - 테스트 결과를 먼저 보고
   - 사용자 확인 후 진행
5. **"~인 것 같다", "~일 수 있다"는 가정으로 코드 수정 금지**
6. **문제 원인을 단정짓지 말고 사용자에게 확인 요청**

---

## V3 API 통합 (2025-12-19)

### disasterHouse & disasterSafeguard

재해보험 앱들은 V3 API로 통합 완료되었습니다.

#### 주요 구조

**앱 위치**:
- `src/apps/safety/disasterHouse/` - 주택풍수해보험 (상품코드 17604)
- `src/apps/safety/disasterSafeguard/` - 재해보장보험 (상품코드 17605)

**공통 서비스**:
- `src/apps/safety/services/consentService.js` - 동의 API
- `src/apps/safety/services/businessVerificationService.js` - 사업자 검증
- `src/context/SessionContext.js` - 세션 토큰 관리
- `src/utils/csrfTokenManager.js` - CSRF 토큰 관리

#### 이중 토큰 인증

V3 API는 두 가지 토큰을 사용합니다:

1. **CSRF Token** (`X-CSRF-Token` 헤더)
   - disaster-api 엔드포인트 호출 시 사용
   - `/api/v3/disaster/premium`, `/api/v3/disaster/contract` 등
   - csrfManager로 자동 관리 (갱신, 재시도)

2. **Session Token** (`X-Session-Token` 헤더)
   - sign-api 엔드포인트 호출 시 사용
   - `/sign-api/nice/api/session-token`, `/sign-api/api/consent/record`
   - SessionContext로 관리 (30분 유효)
   - 본인인증 성공 시 갱신됨

#### 주요 API 엔드포인트

**올바른 엔드포인트 (v2.0)**:
- `/disaster-api/api/v3/disaster/premium/provisional` ✅
- `/disaster-api/api/v3/disaster/contract` ✅
- `/disaster-api/api/v3/disaster/business/verify` ✅

**잘못된 엔드포인트 (deprecated)**:
- `/disaster-api/api/v3/disaster/housing/premium/provisional` ❌
- `/disaster-api/api/v3/disaster/housing/contract` ❌

#### 보안 플로우

1. **보험료 조회** → SessionToken 발급
2. **동의 API** → 템플릿 100-300 기록
3. **본인인증 (NICE)** → SessionToken 갱신
4. **전자서명** (postMessage)
5. **가계약/결제** (암호화 + 이중 토큰)

#### 문서

- **API 참조**: `docs/API_REFERENCE.md`
- **disasterHouse 가이드**: `docs/DISASTER_HOUSE_V3_INTEGRATION_GUIDE.md`
- **disasterSafeguard 가이드**: `docs/DISASTER_SAFEGUARD_INTEGRATION_GUIDE.md`
- **프론트엔드 가이드**: `docs/FRONTEND_COMPLETE_GUIDE.md`

