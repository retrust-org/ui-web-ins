const HtmlWebpackPlugin = require('html-webpack-plugin');
const { processTemplate } = require('./scripts/build-seo');

module.exports = {
  webpack: {
    configure: (webpackConfig, { paths }) => {
      const appType = process.env.REACT_APP_TYPE;

      // 앱 타입에 따라 진입점 변경
      if (appType === "CLAIM") {
        webpackConfig.entry = paths.appSrc + "/index-claim.js";
      } else if (appType === "OVERSEAS") {
        webpackConfig.entry = paths.appSrc + "/index-overseas.js";
      } else if (appType === "DEPARTED") {
        webpackConfig.entry = paths.appSrc + "/index-departed.js";
      } else if (appType === "TRIP") {
        webpackConfig.entry = paths.appSrc + "/index-trip.js";
      } else if (appType === "PARTNER") {
        webpackConfig.entry = paths.appSrc + "/index-partner.js";
      } else if (appType === "HOME") {
        webpackConfig.entry = paths.appSrc + "/index-home.js";
      } else if (appType === "SAFETY") {
        webpackConfig.entry = paths.appSrc + "/index-safety.js";
      } else if (appType === "DISASTER") {
        webpackConfig.entry = paths.appSrc + "/index-disaster.js";
      } else if (appType === "FIRE") {
        webpackConfig.entry = paths.appSrc + "/index-fire.js";
      } else if (appType === "LONGTERM") {
        webpackConfig.entry = paths.appSrc + "/index-longterm.js";
      } else if (appType === "DOMESTIC") {
        webpackConfig.entry = paths.appSrc + "/index-domestic.js";
      } else if (appType === "CERTIFICATE") {
        webpackConfig.entry = paths.appSrc + "/index-certificate.js";
      } else {
        // 기본값: HOME 앱 사용
        webpackConfig.entry = paths.appSrc + "/index-home.js";
      }

      // HTML 웹팩 플러그인 찾아서 templateContent 함수 설정
      const htmlWebpackPluginIndex = webpackConfig.plugins.findIndex(
        plugin => plugin instanceof HtmlWebpackPlugin
      );

      if (htmlWebpackPluginIndex !== -1) {
        // 기존 HtmlWebpackPlugin 설정 가져오기
        const existingHtmlPlugin = webpackConfig.plugins[htmlWebpackPluginIndex];
        const existingOptions = existingHtmlPlugin.options || {};

        // 새로운 HtmlWebpackPlugin으로 교체 (SEO 템플릿 처리 포함)
        webpackConfig.plugins[htmlWebpackPluginIndex] = new HtmlWebpackPlugin({
          ...existingOptions,
          templateContent: ({ htmlWebpackPlugin }) => {
            const fs = require('fs');
            const path = require('path');
            
            // public/index.html 읽기
            const templatePath = path.resolve('./public/index.html');
            let templateContent = fs.readFileSync(templatePath, 'utf8');
            
            // PUBLIC_URL 치환 (SEO 처리 전에 먼저 처리)
            const publicUrl = process.env.PUBLIC_URL || '';
            templateContent = templateContent.replace(/%PUBLIC_URL%/g, publicUrl);
            
            console.log('🔧 PUBLIC_URL 치환:', `%PUBLIC_URL% -> ${publicUrl}`);
            
            // SEO 주입된 템플릿 처리
            return processTemplate(templateContent, {
              PUBLIC_URL: publicUrl,
              ...htmlWebpackPlugin.options
            });
          }
        });
        
        console.log('✅ HtmlWebpackPlugin에 SEO 템플릿 처리 적용');
      }

      return webpackConfig;
    }
  },
};