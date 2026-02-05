// DomesticPlanData.js
// 국내여행 보험 관련 데이터

export const PLAN_TYPES = {
  PREMIUM: "럭셔리 플랜",
  BASIC: "갓성비 플랜",
  LITE: "초실속 플랜",
  ACTIVITY: "액티비티 플랜",
};

export const PLAN_KEYS = {
  "럭셔리 플랜": "PREMIUM",
  "갓성비 플랜": "BASIC",
  "초실속 플랜": "LITE",
  "액티비티 플랜": "ACTIVITY",
};

export const PLAN_LIST = [
  { name: "럭셔리 플랜", dataKey: "PREMIUM", displayName: "럭셔리 플랜" },
  { name: "갓성비 플랜", dataKey: "BASIC", displayName: "갓성비 플랜" },
  { name: "초실속 플랜", dataKey: "LITE", displayName: "초실속 플랜" },
  { name: "액티비티 플랜", dataKey: "ACTIVITY", displayName: "액티비티 플랜" },
];

export const PLAN_DETAILS = {
  [PLAN_TYPES.PREMIUM]: {
    description: [
      "국내여행 중 사건/사고 걱정마세요~🤚",
      "<strong>럭셔리 플랜</strong> 든든한 담보 갯수+ 보장금액",
    ],
  },
  [PLAN_TYPES.BASIC]: {
    description: [
      "가볍게 휴가를 떠나신다면 갓심비 보험! 🔥",
      "<strong>합리적인 플랜</strong> 가장 많이들 드는 BEST 플랜",
    ],
  },
  [PLAN_TYPES.LITE]: {
    description: [
      "최소한의 금액으로 보험을 들고 싶다면? ✨",
      "<strong>저렴한 금액</strong> 꼭 필요한 담보+ 필수 보장금액",
    ],
  },
  [PLAN_TYPES.ACTIVITY]: {
    description: [
      "액티비티가 많은 여행에 추천! 🏄‍♂️",
      "#골절 및 화상 담보 + 응급실 내원시 보장",
    ],
  },
};
