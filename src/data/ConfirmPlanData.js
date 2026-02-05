export const PLAN_TYPES = {
  DEPARTED: "출국 후 여행자 보험",
  RECOMMEND: "추천 플랜",
  PREMIUM: "럭셔리 플랜",
  BASIC: "갓성비 플랜",
  LITE: "초실속 플랜",
  ACTIVITY: "액티비티 플랜",
};

export const PLAN_KEYS = {
  "출국 후 여행자 보험": "DEPARTED",
  "추천 플랜": "RECOMMEND",
  "럭셔리 플랜": "PREMIUM",
  "갓성비 플랜": "BASIC",
  "초실속 플랜": "LITE",
  "액티비티 플랜": "ACTIVITY",
};

export const PLAN_LIST = [
  { name: "추천 플랜", dataKey: "RECOMMEND", displayName: "추천 플랜" },
  { name: "럭셔리 플랜", dataKey: "PREMIUM", displayName: "럭셔리 플랜" },
  { name: "갓성비 플랜", dataKey: "BASIC", displayName: "갓성비 플랜" },
  { name: "초실속 플랜", dataKey: "LITE", displayName: "초실속 플랜" },
  { name: "액티비티 플랜", dataKey: "ACTIVITY", displayName: "액티비티 플랜" },
];

export const PLAN_DETAILS = {
  [PLAN_TYPES.RECOMMEND]: {
    description: [
      "국가별 특징을 고려한 고객 맞춤 보장",
      "ex) 🍣식도락의 국가 일본에서는 식중독 담보는 필수!",
    ],
    showRecommendButton: true,
  },
  [PLAN_TYPES.PREMIUM]: {
    description: [
      "해외여행 중 사건/사고 걱정마세요~🤚",
      "#럭셔리 플랜 액티비티 활동시 추천",
    ],
  },
  [PLAN_TYPES.BASIC]: {
    description: [
      "가볍게 휴가를 떠나신다면 갓심비 보험! 🔥",
      "#합리적인 플랜 든든한 담보 갯수+ 보장금액",
    ],
  },
  [PLAN_TYPES.LITE]: {
    description: [
      "최소한의 금액으로 보험을 들고 싶다면? ✨",
      "#저렴한 금액 꼭 필요한 담보+ 필수 보장금액",
    ],
  },
  [PLAN_TYPES.ACTIVITY]: {
    description: [
      "액티비티가 많은 여행에 추천! 🏄‍♂️",
      "#골절 및 화상 담보 + 응급실 내원시 보장",
    ],
  },
};

