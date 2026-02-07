# B2B 도메인 분기 로직 수정 완료

## 문제점

B2B 도메인 체크 로직이 11개 파일에 하드코딩되어 있었으며, 다음 문제가 발생:

1. **`dev.b2b.retrust.world` 누락**: 11개 파일 모두에서 누락되어 partnerCd가 `undefined`로 처리
2. **`b2b-stage.retrust.world` 누락**: `PartnerContext.js`, `Footer.js`에서 누락
3. **유지보수 어려움**: 도메인 추가 시 11개 파일을 모두 수정해야 함
4. **일관성 부족**: 각 파일마다 다른 도메인 목록

## 해결 방법

중앙화된 `isB2BDomain()` 함수를 만들고 모든 파일에서 import하여 사용.

### 1. 신규 파일 생성: `src/config/domains.js`

```javascript
// B2B 도메인 기본 목록
const DEFAULT_B2B_DOMAINS = [
  "b2b.retrust.world",
  "b2b-dev.retrust.world",
  "b2b-stage.retrust.world",
  "dev.b2b.retrust.world",
];

// REACT_APP_B2B_DOMAINS 환경변수로 오버라이드 가능 (빌드 시 주입, 콤마 구분)
const B2B_DOMAINS = process.env.REACT_APP_B2B_DOMAINS
  ? process.env.REACT_APP_B2B_DOMAINS.split(",").map((d) => d.trim())
  : DEFAULT_B2B_DOMAINS;

export const isB2BDomain = (hostname) => {
  if (!hostname) hostname = typeof window !== "undefined" ? window.location.hostname : "";
  return B2B_DOMAINS.includes(hostname);
};
```

**특징:**
- CRA 빌드 환경에 맞춰 `REACT_APP_B2B_DOMAINS` 환경변수로 오버라이드 가능
- 기본 값으로 4개 도메인 포함 (dev.b2b.retrust.world 추가)
- 단일 책임 원칙 (Single Source of Truth)

### 2. 수정된 파일 목록 (10개)

#### 2-1. `src/config/partners.js`
```javascript
import { isB2BDomain } from "./domains";

// B2B 도메인에서 파트너 코드 추출
if (isB2BDomain(hostname)) {
  // ...
}
```

#### 2-2. `src/context/PartnerContext.js`
```javascript
import { isB2BDomain as checkB2BDomain } from "../config/domains";

const isB2BDomain = () => {
  if (typeof window === "undefined") return false;
  const hostname = window.location.hostname;
  return checkB2BDomain(hostname);
};
```

#### 2-3 ~ 2-8. `index-*.js` 6개 파일
- `src/index-overseas.js`
- `src/index-departed.js`
- `src/index-longterm.js`
- `src/index-domestic.js`
- `src/index-partner.js`
- `src/index-claim.js`

```javascript
import { isB2BDomain } from "./config/domains";

const getBasename = () => {
  // ...
  if (isB2BDomain(hostname)) return `/${partnerCode}/...`;
  // ...
};
```

#### 2-9. `src/hooks/useHomeNavigate.js`
```javascript
import { isB2BDomain } from "../config/domains";

const navigateToHome = () => {
  if (isB2BDomain(hostname)) {
    // ...
  }
};
```

#### 2-10. `src/components/footer/Footer.js`
```javascript
import { isB2BDomain } from "../../config/domains";

const emergencyNavigate = () => {
  if (isB2BDomain(hostname)) {
    // ...
  }
};

const navigateToPage = (path) => {
  if (isB2BDomain(hostname)) {
    // ...
  }
};
```

## 변경 사항 검증

### 하드코딩 제거 확인
```bash
cd /mnt/c/Users/RT-Dominic/_Project/app-ins/ui-web-ins
find src -name "*.js" -exec grep -l "b2b.retrust.world\|b2b-dev.retrust.world" {} \;
# 결과: src/config/domains.js 만 출력됨 ✅
```

### isB2BDomain 사용 확인
```bash
grep -n "isB2BDomain" src/config/{domains,partners}.js \
  src/context/PartnerContext.js \
  src/hooks/useHomeNavigate.js \
  src/components/footer/Footer.js \
  src/index-{overseas,departed,longterm,domestic,partner,claim}.js
# 결과: 모든 파일에서 import 및 사용 확인 ✅
```

## 배포 방법

### Option 1: 자동 배포 스크립트 (권장)

```bash
cd /mnt/c/Users/RT-Dominic/_Project/app-ins/ui-web-ins
./deploy-b2b-apps.sh
```

이 스크립트는 다음을 수행합니다:
1. 6개 B2B 앱 빌드 (partner, claim, overseas, departed, longterm, domestic)
2. rsync로 서버(10.0.10.10)에 업로드 (Bastion 경유)
3. 빌드 및 배포 성공/실패 확인

### Option 2: 수동 빌드 및 배포

```bash
cd /mnt/c/Users/RT-Dominic/_Project/app-ins/ui-web-ins

# 빌드
npm run build:partner
npm run build:claim
npm run build:overseas
npm run build:departed
npm run build:longterm
npm run build:domestic

# 서버 배포 (rsync, ProxyJump 사용)
rsync -avz --delete \
  -e "ssh -o ProxyJump=<BASTION_USER>@<BASTION_HOST>" \
  /var/www/partner/ <SERVER_USER>@<SERVER_HOST>:/var/www/html/partner/

rsync -avz --delete \
  -e "ssh -o ProxyJump=<BASTION_USER>@<BASTION_HOST>" \
  /var/www/claim/ <SERVER_USER>@<SERVER_HOST>:/var/www/html/claim/

rsync -avz --delete \
  -e "ssh -o ProxyJump=<BASTION_USER>@<BASTION_HOST>" \
  /var/www/trip/overseas/ <SERVER_USER>@<SERVER_HOST>:/var/www/html/trip/overseas/

rsync -avz --delete \
  -e "ssh -o ProxyJump=<BASTION_USER>@<BASTION_HOST>" \
  /var/www/trip/departed/ <SERVER_USER>@<SERVER_HOST>:/var/www/html/trip/departed/

rsync -avz --delete \
  -e "ssh -o ProxyJump=<BASTION_USER>@<BASTION_HOST>" \
  /var/www/trip/longterm/ <SERVER_USER>@<SERVER_HOST>:/var/www/html/trip/longterm/

rsync -avz --delete \
  -e "ssh -o ProxyJump=<BASTION_USER>@<BASTION_HOST>" \
  /var/www/trip/domestic/ <SERVER_USER>@<SERVER_HOST>:/var/www/html/trip/domestic/
```

## 검증 절차

### 1. 빌드 성공 확인
각 앱의 `build/` 디렉토리가 생성되고 `build/static/` 디렉토리가 존재하는지 확인.

### 2. dev.b2b.retrust.world 테스트
```
URL: dev.b2b.retrust.world/testb2b
기대값: partnerCd = "testb2b"
```

브라우저 개발자 도구에서 `partnerConfig` 상태 확인:
- React DevTools → PartnerContext → partnerConfig.partner_cd
- 또는 `console.log(window.basename)` → `/testb2b` 출력

### 3. b2b-stage.retrust.world 테스트
```
URL: b2b-stage.retrust.world/pinkb2b/claim
기대값: partnerCd = "pinkb2b", basename = "/pinkb2b/claim"
```

### 4. 일반 도메인 테스트
```
URL: dev.insu.retrust.world/trip/overseas
기대값: B2B 분기 없이 정상 작동, partnerCd = null
```

## 향후 도메인 추가 시

### 방법 1: 코드 수정 (권장)
`src/config/domains.js` 파일의 `DEFAULT_B2B_DOMAINS` 배열에 도메인 추가:

```javascript
const DEFAULT_B2B_DOMAINS = [
  "b2b.retrust.world",
  "b2b-dev.retrust.world",
  "b2b-stage.retrust.world",
  "dev.b2b.retrust.world",
  "new-b2b-domain.com",  // 신규 도메인 추가
];
```

### 방법 2: 환경변수 사용
빌드 시 `REACT_APP_B2B_DOMAINS` 환경변수로 오버라이드:

```bash
REACT_APP_B2B_DOMAINS="b2b.retrust.world,b2b-dev.retrust.world,new-domain.com" \
  npm run build:partner
```

**장점:**
- 코드 수정 없이 빌드 시점에 도메인 목록 변경 가능
- CI/CD 환경에서 유연하게 대응 가능

## 주요 개선 사항

1. ✅ **단일 책임 원칙**: 도메인 목록을 한 곳에서만 관리
2. ✅ **확장성**: 환경변수로 오버라이드 가능
3. ✅ **일관성**: 모든 파일에서 동일한 도메인 목록 사용
4. ✅ **유지보수성**: 도메인 추가 시 1개 파일만 수정
5. ✅ **누락 방지**: `dev.b2b.retrust.world`, `b2b-stage.retrust.world` 추가

## 관련 파일

- 신규: `src/config/domains.js`
- 수정: 10개 파일 (partners.js, PartnerContext.js, useHomeNavigate.js, Footer.js, index-*.js 6개)
- 배포 스크립트: `deploy-b2b-apps.sh`
- 문서: `B2B_DOMAIN_REFACTORING.md` (이 파일)
