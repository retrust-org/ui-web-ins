import { createAppEntry } from "./appEntryFactory";

// 재해보험 앱별 상품코드 매핑
const DISASTER_PRODUCT_CODES = {
  safeguard: "17605", // 재해보장보험 (소상공인)
  house: "17604",     // 주택재해보험
  governance: "17605" // 관리재해보험 (재해보장보험과 동일 상품코드 추정)
};

const disasterAppType = process.env.REACT_APP_DISASTER_APP || "safeguard";
const productCd = DISASTER_PRODUCT_CODES[disasterAppType];

createAppEntry({
  Router: null, // 실제 라우터는 disasterApp에 따라 결정됨
  appName: "Disaster",
  useAppComponent: true,
  disasterApp: disasterAppType,
  productCd: productCd, // 앱별 상품코드 전달
});
