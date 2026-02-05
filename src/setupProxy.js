const { createProxyMiddleware } = require("http-proxy-middleware");
const express = require("express");
const path = require("path");

module.exports = function (app) {
  // 기존 이미지 경로도 처리할 수 있도록 추가 미들웨어 설정
  app.use(
    "/bankIamges",
    express.static(path.join(__dirname, "../public/bankIamges"))
  );
  app.use("/csv", express.static(path.join(__dirname, "../public/csv")));
  app.use("/images", express.static(path.join(__dirname, "../public/images")));
  app.use(
    "/nationImages",
    express.static(path.join(__dirname, "../public/nationImages"))
  );
  app.use("/pdf", express.static(path.join(__dirname, "../public/pdf")));

  // 개발 환경 여부 확인
  const isDevelopment = process.env.NODE_ENV === "development";

  // 환경별 기본 타겟 설정
  const baseTarget = isDevelopment
    ? "http://127.0.0.1:5001" // 개발 환경
    : "http://127.0.0.1:5001"; // 운영 환경

  // 공통 프록시 설정
  const commonConfig = {
    target: baseTarget,
    changeOrigin: false,
  };

  // // auth 전용 설정
  // const authConfig = {
  //   target: `${baseTarget}/auth`, // auth 전용 경로
  //   changeOrigin: true,
  // };

  // 일반 API 엔드포인트들
  const endpoints = [
    "/auth",
    "/trip-api",
    "/api",
    "/card-api",
    "/pay",
    "/escrow-api",
    "/cancel-api",
    "/member-api",
  ];

  // 일반 엔드포인트들에 대한 프록시 설정 적용
  endpoints.forEach((endpoint) => {
    app.use(endpoint, createProxyMiddleware(commonConfig));
  });
};
