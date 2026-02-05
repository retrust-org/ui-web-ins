// scripts/build-seo.js (간단한 버전)
const fs = require('fs');
const path = require('path');
const seoConfigs = require('./seo-config');

function injectSEOToTemplate() {
  console.log('🚀 동적 SEO 데이터 주입 시작...');
  
  const appType = process.env.REACT_APP_TYPE;
  const publicUrl = process.env.PUBLIC_URL || '';
  
  let configKey = null;
  
  // REACT_APP_TYPE 기반 매칭 (HOME 제외)
  switch(appType) {
    case 'OVERSEAS':
      configKey = 'trip/overseas';
      break;
    case 'DEPARTED':
      configKey = 'trip/departed';
      break;
    case 'LONGTERM':
      configKey = 'trip/longterm';
      break;
    case 'DOMESTIC':
      configKey = 'trip/domestic';
      break;
    default:
      if (publicUrl === '/trip/overseas') {
        configKey = 'trip/overseas';
      } else if (publicUrl === '/trip/departed') {
        configKey = 'trip/departed';
      } else if (publicUrl === '/trip/longterm') {
        configKey = 'trip/longterm';
      } else if (publicUrl === '/trip/domestic') {
        configKey = 'trip/domestic';
      }
      // HOME, CLAIM, SAFETY, CERTIFICATE 등은 configKey가 null이 됨
      break;
  }
  
  // configKey가 null이면 SEO 주입하지 않음
  if (!configKey) {
    console.log(`⏭️  SEO 주입 건너뜀: ${appType || 'UNKNOWN'} 앱`);
    return null;
  }

  
  const config = seoConfigs[configKey];
  if (!config) {
    console.error(`❌ SEO 설정을 찾을 수 없습니다: ${configKey}`);
    return null;
  }
  
  // 기존 public/index.html 읽기
  const templatePath = path.resolve('./public/index.html');
  if (!fs.existsSync(templatePath)) {
    console.error('❌ public/index.html 템플릿을 찾을 수 없습니다');
    return null;
  }
  
  let htmlTemplate = fs.readFileSync(templatePath, 'utf8');
  
  try {
    console.log('📝 동적 SEO 데이터 및 PUBLIC_URL 치환 중...');
    
    // === %PUBLIC_URL% 치환 먼저 수행 ===
    htmlTemplate = htmlTemplate.replace(/%PUBLIC_URL%/g, publicUrl);
    console.log(`✅ PUBLIC_URL 치환 완료: "${publicUrl}"`);
    
    // === 🆕 manifest.json 경로를 상대 경로로 변경 ===
    console.log('🔗 manifest.json 경로를 상대 경로로 변경 중...');
    
    // 모든 manifest 태그를 상대 경로로 교체
    htmlTemplate = htmlTemplate.replace(
      /<link\s+rel="manifest"\s+href="[^"]*"\s*\/>/gi,
      '<link rel="manifest" href="/manifest.json" />'
    );
    
    console.log('✅ manifest.json 경로를 상대 경로로 설정');
    
    // === HOME용 JSON-LD 제거 ===
    console.log('🗑️  HOME용 JSON-LD 제거 중...');
    
    // WebSite JSON-LD 제거
    htmlTemplate = htmlTemplate.replace(
      /<\s*script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>\s*\{[^}]*"@type"\s*:\s*["']WebSite["'][^}]*\}[^<]*<\/script>/gis,
      ''
    );
    
    // Organization JSON-LD 제거
    htmlTemplate = htmlTemplate.replace(
      /<\s*script[^>]*type\s*=\s*["']application\/ld\+json["'][^>]*>\s*\{[^}]*"@type"\s*:\s*["']Organization["'][^}]*\}[^<]*<\/script>/gis,
      ''
    );
    
    console.log('✅ HOME용 JSON-LD 제거 완료');
    
    // 1. Title 교체
    htmlTemplate = htmlTemplate.replace(
      /<title>.*?<\/title>/i,
      `<title>${config.title}</title>`
    );
    
    // 2. Description 교체
    htmlTemplate = htmlTemplate.replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="description" content="${config.description}" />`
    );
    
    // 3. Keywords 교체
    htmlTemplate = htmlTemplate.replace(
      /<meta\s+name="keywords"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="keywords" content="${config.keywords}" />`
    );
    
    // 4. Open Graph 동적 데이터만 교체
    htmlTemplate = htmlTemplate.replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:title" content="${config.title}" />`
    );
    
    htmlTemplate = htmlTemplate.replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:url" content="${config.url}" />`
    );
    
    htmlTemplate = htmlTemplate.replace(
      /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta property="og:description" content="${config.description}" />`
    );
    
    // 5. Twitter Card 동적 데이터만 교체
    htmlTemplate = htmlTemplate.replace(
      /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:title" content="${config.title}" />`
    );
    
    htmlTemplate = htmlTemplate.replace(
      /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/i,
      `<meta name="twitter:description" content="${config.description}" />`
    );
    
    // 6. Canonical URL 교체
    htmlTemplate = htmlTemplate.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/i,
      `<link rel="canonical" href="${config.url}" />`
    );
    
    // 7. 상품용 JSON-LD 주입
    if (config.jsonLd) {
      console.log('📋 상품용 JSON-LD 주입 중...');
      
      const jsonLdScript = `
    <script type="application/ld+json">
    ${JSON.stringify(config.jsonLd, null, 2)}
    </script>`;
      
      // </head> 바로 앞에 상품 JSON-LD 삽입
      htmlTemplate = htmlTemplate.replace(
        /<\/head>/i,
        `${jsonLdScript}
    </head>`
      );
      
      console.log(`✅ 상품용 JSON-LD 주입 완료`);
    } else {
      console.log('ℹ️  상품 JSON-LD 설정 없음, 건너뜀');
    }
    
    console.log(`✅ 동적 SEO 데이터 주입 완료: ${configKey}`);
    console.log(`📄 Title: ${config.title}`);
    console.log(`📝 Description: ${config.description.substring(0, 50)}...`);
    console.log(`🔗 URL: ${config.url}`);
    
    return htmlTemplate;
    
  } catch (error) {
    console.error(`❌ SEO 주입 중 오류 발생:`, error);
    return htmlTemplate; // 원본 반환
  }
}

// HTML 웹팩 플러그인용 템플릿 처리 함수
function processTemplate(templateContent, templateParameters) {
  console.log('📝 템플릿 처리 시작...');
  
  // SEO 주입 시도
  const seoInjectedTemplate = injectSEOToTemplate();
  
  // SEO 설정이 없으면 기본 React 처리만 수행
  if (!seoInjectedTemplate) {
    console.log('📝 SEO 설정 없음: 기본 React 템플릿 처리만 수행');
    
    // 기본 처리에서도 manifest를 상대 경로로 변경
    let processedTemplate = templateContent.replace(/%([^%]+)%/g, (match, key) => {
      return templateParameters[key] || match;
    });
    
    // manifest 상대 경로 처리
    processedTemplate = processedTemplate.replace(
      /<link\s+rel="manifest"\s+href="[^"]*"\s*\/>/gi,
      '<link rel="manifest" href="/manifest.json" />'
    );
    
    console.log('✅ 기본 템플릿에서도 manifest를 상대 경로로 설정');
    
    return processedTemplate;
  }
  
  // SEO 주입이 성공한 경우
  console.log('✅ SEO 주입 완료: 추가 템플릿 변수 처리');
  return seoInjectedTemplate.replace(/%([^%]+)%/g, (match, key) => {
    if (key === 'PUBLIC_URL') {
      return match; // 이미 처리됨
    }
    return templateParameters[key] || match;
  });
}

module.exports = { 
  injectSEOToTemplate, 
  processTemplate 
};