#!/bin/bash
set -e

# B2B 도메인 분기 로직 수정 후 배포 스크립트
# 수정된 파일: src/config/domains.js (신규), partners.js, PartnerContext.js, useHomeNavigate.js, Footer.js,
#             index-{overseas,departed,longterm,domestic,partner,claim}.js

echo "======================================"
echo "B2B 앱 빌드 및 배포 시작"
echo "======================================"
echo ""

# 현재 디렉토리 확인
if [ ! -f "package.json" ]; then
  echo "❌ Error: package.json이 없습니다. ui-web-ins 디렉토리에서 실행하세요."
  exit 1
fi

# 빌드할 앱 목록
apps=("partner" "claim" "overseas" "departed" "longterm" "domestic")

# 서버 정보
SERVER_USER="${DEPLOY_SERVER_USER:-root}"
SERVER_HOST="${DEPLOY_SERVER_HOST:?DEPLOY_SERVER_HOST 환경변수를 설정하세요}"
SERVER_BASE_PATH="/var/www/html"

# Bastion 정보 (ProxyJump)
BASTION_USER="${DEPLOY_BASTION_USER:?DEPLOY_BASTION_USER 환경변수를 설정하세요}"
BASTION_HOST="${DEPLOY_BASTION_HOST:?DEPLOY_BASTION_HOST 환경변수를 설정하세요}"

echo "📦 빌드 시작..."
echo ""

for app in "${apps[@]}"; do
  echo "🔨 Building $app..."

  # 빌드 실행
  npm run build:$app

  if [ $? -eq 0 ]; then
    echo "✅ $app 빌드 완료"
  else
    echo "❌ $app 빌드 실패"
    exit 1
  fi
  echo ""
done

echo ""
echo "======================================"
echo "빌드 완료. 서버 배포 시작..."
echo "======================================"
echo ""

# 배포 매핑 (빌드 디렉토리 → 서버 경로)
declare -A deploy_paths=(
  ["partner"]="/var/www/html/partner"
  ["claim"]="/var/www/html/claim"
  ["overseas"]="/var/www/html/trip/overseas"
  ["departed"]="/var/www/html/trip/departed"
  ["longterm"]="/var/www/html/trip/longterm"
  ["domestic"]="/var/www/html/trip/domestic"
)

for app in "${apps[@]}"; do
  server_path="${deploy_paths[$app]}"

  echo "📤 Deploying $app to $server_path..."

  # rsync로 서버에 배포 (ProxyJump 사용)
  rsync -avz --delete \
    -e "ssh -o ProxyJump=${BASTION_USER}@${BASTION_HOST}" \
    /var/www/${app}/  ${SERVER_USER}@${SERVER_HOST}:${server_path}/

  if [ $? -eq 0 ]; then
    echo "✅ $app 배포 완료: $server_path"
  else
    echo "❌ $app 배포 실패"
    exit 1
  fi
  echo ""
done

echo ""
echo "======================================"
echo "🎉 모든 B2B 앱 배포 완료!"
echo "======================================"
echo ""
echo "검증 명령어:"
echo "  dev.b2b.retrust.world/testb2b → partnerCd = 'testb2b'"
echo "  dev.insu.retrust.world/trip/overseas → 일반 경로 정상 작동"
echo ""
