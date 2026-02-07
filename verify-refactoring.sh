#!/bin/bash

echo "======================================"
echo "B2B 도메인 리팩토링 검증 스크립트"
echo "======================================"
echo ""

cd "$(dirname "$0")"

# 1. domains.js 존재 확인
echo "1️⃣ domains.js 파일 존재 확인..."
if [ -f "src/config/domains.js" ]; then
  echo "   ✅ src/config/domains.js 존재"
else
  echo "   ❌ src/config/domains.js 없음"
  exit 1
fi
echo ""

# 2. 하드코딩된 도메인 체크 (domains.js 제외)
echo "2️⃣ 하드코딩된 도메인 체크 확인 (domains.js 제외)..."
HARDCODED=$(find src -name "*.js" ! -path "*/config/domains.js" -exec grep -l "b2b.retrust.world\|b2b-dev.retrust.world\|b2b-stage.retrust.world\|dev.b2b.retrust.world" {} \;)

if [ -z "$HARDCODED" ]; then
  echo "   ✅ 하드코딩된 도메인 없음 (모두 제거됨)"
else
  echo "   ❌ 하드코딩된 도메인 발견:"
  echo "$HARDCODED"
  exit 1
fi
echo ""

# 3. isB2BDomain import 확인
echo "3️⃣ isB2BDomain import 확인..."
FILES_TO_CHECK=(
  "src/config/partners.js"
  "src/context/PartnerContext.js"
  "src/hooks/useHomeNavigate.js"
  "src/components/footer/Footer.js"
  "src/index-overseas.js"
  "src/index-departed.js"
  "src/index-longterm.js"
  "src/index-domestic.js"
  "src/index-partner.js"
  "src/index-claim.js"
)

ALL_IMPORTS_OK=true
for file in "${FILES_TO_CHECK[@]}"; do
  if grep -q "import.*isB2BDomain.*from.*domains" "$file"; then
    echo "   ✅ $file"
  else
    echo "   ❌ $file (import 누락)"
    ALL_IMPORTS_OK=false
  fi
done

if [ "$ALL_IMPORTS_OK" = false ]; then
  exit 1
fi
echo ""

# 4. domains.js 내용 확인
echo "4️⃣ domains.js 내용 확인..."
if grep -q "dev.b2b.retrust.world" "src/config/domains.js"; then
  echo "   ✅ dev.b2b.retrust.world 포함"
else
  echo "   ❌ dev.b2b.retrust.world 누락"
  exit 1
fi

if grep -q "b2b-stage.retrust.world" "src/config/domains.js"; then
  echo "   ✅ b2b-stage.retrust.world 포함"
else
  echo "   ❌ b2b-stage.retrust.world 누락"
  exit 1
fi
echo ""

# 5. 빌드 스크립트 존재 확인
echo "5️⃣ 배포 스크립트 확인..."
if [ -f "deploy-b2b-apps.sh" ] && [ -x "deploy-b2b-apps.sh" ]; then
  echo "   ✅ deploy-b2b-apps.sh 존재 및 실행 권한 있음"
else
  echo "   ⚠️  deploy-b2b-apps.sh 없거나 실행 권한 없음"
fi
echo ""

echo "======================================"
echo "✅ 모든 검증 통과!"
echo "======================================"
echo ""
echo "다음 단계:"
echo "  1. npm run build:partner (테스트)"
echo "  2. ./deploy-b2b-apps.sh (전체 배포)"
echo "  3. dev.b2b.retrust.world/testb2b 접속 확인"
echo ""
