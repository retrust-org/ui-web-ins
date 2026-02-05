import { configureStore, createSlice, combineReducers } from "@reduxjs/toolkit";

const purposeSlice = createSlice({
  name: "purpose",
  initialState: {
    purpose: null,
  },
  reducers: {
    setPurpose: (state, action) => {
      state.purpose = action.payload;
    },
    reset: () => ({
      purpose: null,
    }),
  },
});

const pdfSlice = createSlice({
  name: "pdf",
  initialState: {
    pdfBlobs: {},
    isFromCsvUpload: false,
  },
  reducers: {
    setPDFBlobs: (state, action) => {
      state.pdfBlobs = action.payload;
    },
    clearPDFBlobs: (state) => {
      state.pdfBlobs = {};
    },
    setIsFromCsvUpload: (state, action) => {
      state.isFromCsvUpload = action.payload;
    },
    reset: () => ({
      pdfBlobs: {},
      isFromCsvUpload: false,
    }),
  },
});

const hasDepartedSlice = createSlice({
  name: "hasDeparted",
  initialState: {
    isDeparted: false,
  },
  reducers: {
    setHasDeparted(state, action) {
      state.isDeparted = action.payload;
    },
    reset: () => ({
      isDeparted: false,
    }),
  },
});

const personalInfoSlice = createSlice({
  name: "personalInfo",
  initialState: {
    koreanName: "",
    englishName: "",
    email: "",
    phoneNumber: "",
  },
  reducers: {
    setKoreanName(state, action) {
      state.koreanName = action.payload;
    },
    setEnglishName(state, action) {
      state.englishName = action.payload;
    },
    setEmail(state, action) {
      state.email = action.payload;
    },
    setPhoneNumber(state, action) {
      state.phoneNumber = action.payload;
    },
    reset: () => ({
      koreanName: "",
      englishName: "",
      email: "",
      phoneNumber: "",
    }),
  },
});

const planSlice = createSlice({
  name: "plan",
  initialState: {
    selectedData: null,
    selectedPlanName: null,
  },
  reducers: {
    selectData(state, action) {
      state.selectedData = action.payload;
    },
    setSelectedPlanName(state, action) {
      state.selectedPlanName = action.payload;
    },
    reset: () => ({
      selectedData: null,
      selectedPlanName: null,
    }),
  },
});

const calendarSlice = createSlice({
  name: "calendar",
  initialState: {
    selectedStartDate: null,
    selectedEndDate: null,
  },
  reducers: {
    selectStartDate(state, action) {
      state.selectedStartDate = action.payload;
    },
    selectEndDate(state, action) {
      state.selectedEndDate = action.payload;
    },
    reset: () => ({
      selectedStartDate: null,
      selectedEndDate: null,
    }),
  },
});

const userSlice = createSlice({
  name: "user",
  initialState: {
    gender: "",
    dateOfBirth: "",
  },
  reducers: {
    setGender(state, action) {
      state.gender = action.payload;
    },
    setDateOfBirth(state, action) {
      state.dateOfBirth = action.payload;
    },
    reset: () => ({
      gender: "",
      dateOfBirth: "",
    }),
  },
});

const companionsSlice = createSlice({
  name: "companions",
  initialState: [],
  reducers: {
    setCompanions(state, action) {
      return action.payload;
    },
    addCompanion(state, action) {
      state.push(action.payload);
    },
    updateCompanionGender(state, action) {
      const { index, gender } = action.payload;
      state[index].gender = gender;
    },
    updateCompanionDateOfBirth(state, action) {
      const { index, dateOfBirth } = action.payload;
      state[index].dateOfBirth = dateOfBirth;
    },
    deleteCompanion(state, action) {
      state.splice(action.payload, 1);
    },
    reset: () => [],
  },
});

const userFormSlice = createSlice({
  name: "userForm",
  initialState: {
    name: "",
    englishName: "",
    phoneNumber: "",
    email: "",
  },
  reducers: {
    setUserFormData: (state, action) => {
      return { ...state, ...action.payload };
    },
    clearUserFormData: () => {
      return {
        name: "",
        englishName: "",
        phoneNumber: "",
        email: "",
      };
    },
    reset: () => ({
      name: "",
      englishName: "",
      phoneNumber: "",
      email: "",
    }),
  },
});

const companionFormSlice = createSlice({
  name: "companionForm",
  initialState: [],
  reducers: {
    setCompanionFormData: (state, action) => {
      return action.payload;
    },
    clearCompanionFormData: () => {
      return [];
    },
    reset: () => [],
  },
});

const countrySlice = createSlice({
  name: "country",
  initialState: {
    selectedCountryData: null,
    recommendedCountryData: null,
  },
  reducers: {
    setSelectedCountryData(state, action) {
      state.selectedCountryData = action.payload;
    },
    setRecommendedCountryData(state, action) {
      state.recommendedCountryData = action.payload;
    },
    clearCountryData(state) {
      state.selectedCountryData = null;
      state.recommendedCountryData = null;
    },
    reset: () => ({
      selectedCountryData: null,
      recommendedCountryData: null,
    }),
  },
});
const totalPriceSlice = createSlice({
  name: "totalPrice",
  initialState: {
    totalPrice: null,
  },
  reducers: {
    setTotalPrice(state, action) {
      state.totalPrice = action.payload;
    },
    reset: () => ({
      totalPrice: null,
    }),
  },
});

const priceDataSlice = createSlice({
  name: "priceData",
  initialState: {
    priceData: null,
  },
  reducers: {
    setPriceData(state, action) {
      state.priceData = action.payload;
    },
    reset: () => ({
      priceData: null,
    }),
  },
});

const authSlice = createSlice({
  name: "auth",
  initialState: {
    token: null,
    isTokenValidated: null,
    isAuthenticated: null,
  },
  reducers: {
    login(state, action) {
      state.token = action.payload;
      state.isAuthenticated = true;
    },
    logout(state) {
      state.token = null;
      state.isAuthenticated = false;
      state.isTokenValidated = false;
    },
    setTokenValidation(state, action) {
      state.isTokenValidated = true;
      state.isAuthenticated = action.payload;
    },
  },
});

const claimSlice = createSlice({
  name: "claim",
  initialState: {
    birthSecondPart: "",
    status: null,
    message: null,
  },
  reducers: {
    setBirthSecondPart(state, action) {
      state.birthSecondPart = action.payload;
    },
  },
});

const membersDataSlice = createSlice({
  name: "members",
  initialState: {
    members: "",
  },
  reducers: {
    setMembersData(state, action) {
      state.members = action.payload;
    },
  },
});

const insuranceSlice = createSlice({
  name: "insurance",
  initialState: {
    insurances: {
      Insurances: [],
      name: "",
    },
  },
  reducers: {
    setInsurance(state, action) {
      state.insurances = action.payload;
    },
    reset: () => ({
      insurances: {
        Insurances: [],
        name: "",
      },
    }),
  },
});

const cookieSlice = createSlice({
  name: "cookie",
  initialState: {
    cookie: [],
    mrzUser: false,
  },
  reducers: {
    setCookie(state, action) {
      state.cookie = action.payload;
    },
    setMrzUser(state, action) {
      state.mrzUser = action.payload;
    },
  },
});

const appStateSlice = createSlice({
  name: "appState",
  initialState: {
    currentAppType: "",
    previousAppType: "",
  },
  reducers: {
    setAppType: (state, action) => {
      state.previousAppType = state.currentAppType;
      state.currentAppType = action.payload;
    },
  },
});

// KLIP 인증 슬라이스 (핵심)
const klipAuthSlice = createSlice({
  name: "klipAuth",
  initialState: {
    requestId: null,
    deepLink: null,
    isReady: false,
    isProcessing: false,
    isAutoRefreshing: false,
    refreshCount: 0,
    maxRefreshCount: 10,
    isLoginProcessing: false,
    loginStartTime: null,
    error: null,
    startTime: null,
    expiresAt: null,
  },
  reducers: {
    setKlipData: (state, action) => {
      const { request_id, deep_link } = action.payload;
      state.requestId = request_id;
      state.deepLink = deep_link;
      state.isReady = true;
      state.startTime = Date.now();
      state.expiresAt = Date.now() + (90 * 1000);
      state.error = null;
    },
    setProcessing: (state, action) => {
      state.isProcessing = action.payload;
    },
    setAutoRefreshing: (state, action) => {
      state.isAutoRefreshing = action.payload;
    },
    incrementRefreshCount: (state) => {
      state.refreshCount += 1;
      if (state.refreshCount >= state.maxRefreshCount) {
        state.isReady = false;
        state.error = "인증 시간이 만료되었습니다. 페이지를 새로고침해 주세요.";
        state.isAutoRefreshing = false;
      }
    },
    setLoginProcessing: (state, action) => {
      state.isLoginProcessing = action.payload;
      if (action.payload) {
        state.loginStartTime = Date.now();
      } else {
        state.loginStartTime = null;
      }
    },
    setKlipError: (state, action) => {
      state.error = action.payload;
    },
    clearKlipAuth: (state) => {
      Object.assign(state, {
        requestId: null,
        deepLink: null,
        isReady: false,
        isProcessing: false,
        isAutoRefreshing: false,
        refreshCount: 0,
        isLoginProcessing: false,
        loginStartTime: null,
        error: null,
        startTime: null,
        expiresAt: null,
      });
    },
  },
});

const rootReducer = combineReducers({
  purpose: purposeSlice.reducer,
  hasDeparted: hasDepartedSlice.reducer,
  plan: planSlice.reducer,
  calendar: calendarSlice.reducer,
  user: userSlice.reducer,
  companions: companionsSlice.reducer,
  country: countrySlice.reducer,
  totalPrice: totalPriceSlice.reducer,
  priceData: priceDataSlice.reducer,
  auth: authSlice.reducer,
  claim: claimSlice.reducer,
  members: membersDataSlice.reducer,
  insurance: insuranceSlice.reducer,
  cookie: cookieSlice.reducer,
  personalInfo: personalInfoSlice.reducer,
  userForm: userFormSlice.reducer,
  companionForm: companionFormSlice.reducer,
  pdf: pdfSlice.reducer,
  appState: appStateSlice.reducer,
  klipAuth: klipAuthSlice.reducer,
});

const defaultState = {
  purpose: { purpose: null },
  hasDeparted: { isDeparted: false },
  plan: { selectedData: null, selectedPlanName: null },
  calendar: { selectedStartDate: null, selectedEndDate: null },
  user: { gender: "", dateOfBirth: "" },
  companions: [],
  country: { selectedCountryData: null, recommendedCountryData: null },
  totalPrice: { totalPrice: null },
  priceData: { priceData: null },
  insurance: {
    insurances: {
      Insurances: [],
      name: "",
    },
  },
  members: { members: "" },
  cookie: { cookie: [], mrzUser: false },
  personalInfo: { koreanName: "", englishName: "", email: "", phoneNumber: "" },
  userForm: { name: "", englishName: "", phoneNumber: "", email: "" },
  companionForm: [],
  auth: {
    token: null,
    isTokenValidated: false,
    isAuthenticated: false,
  },
  appState: {
    currentAppType: "",
    previousAppType: "",
  },
  klipAuth: {
    requestId: null,
    deepLink: null,
    isReady: false,
    isProcessing: false,
    isAutoRefreshing: false, 
    refreshCount: 0, 
    maxRefreshCount: 10,
    isLoginProcessing: false,
    loginStartTime: null,
    error: null,
    startTime: null,
    expiresAt: null, 
  },
};

const preloadedState = (() => {
  const savedState = JSON.parse(sessionStorage.getItem("reduxState") || "{}");
  return {
    ...defaultState,
    ...savedState,
  };
})();

const expectedKeys = Object.keys(defaultState);

Object.keys(preloadedState).forEach((key) => {
  if (!expectedKeys.includes(key)) {
    delete preloadedState[key];
  }
});

const getStatesToResetByAppType = (appType) => {
  const commonResetStates = [
    "purpose",
    "plan",
    "calendar",
    "country",
    "totalPrice",
    "priceData",
    "companions",
    "personalInfo",
    "userForm",
    "companionForm",
    "pdf",
    "insurance",
    "user",
  ];

  switch (appType) {
    case "OVERSEAS":
      return commonResetStates;
    case "LONGTERM":
      return commonResetStates;
    case "DEPARTED":
      return commonResetStates;
    case "TRIP":
      return commonResetStates;
    case "HOME":
    case "CLAIM":
    case "SAFETY":
    case "DISASTER":
    case "FIRE":
    case "PARTNER":
      return commonResetStates;
    default:
      return commonResetStates;
  }
};

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["pdf/setPDFBlobs"],
        ignoredPaths: ["pdf.pdfBlobs"],
      },
    }),
  preloadedState,
});

store.subscribe(() => {
  const state = store.getState();
  const { claim, ...stateToSave } = state;
  sessionStorage.setItem("reduxState", JSON.stringify(stateToSave));
});

export const resetAppState = (appType) => (dispatch, getState) => {
  const { appState } = getState();

  if (appState.currentAppType === appType) {
    return;
  }

  dispatch(appStateSlice.actions.setAppType(appType));

  const statesToReset = getStatesToResetByAppType(appType);

  statesToReset.forEach((sliceName) => {
    dispatch({ type: `${sliceName}/reset` });
  });
};

// 모든 액션 creators 내보내기
export const {
  setPurpose,
  setHasDeparted,
  selectData,
  setSelectedPlanName,
  selectStartDate,
  selectEndDate,
  setGender,
  setDateOfBirth,
  setCompanions,
  addCompanion,
  updateCompanionGender,
  updateCompanionDateOfBirth,
  deleteCompanion,
  setSelectedCountryData,
  setRecommendedCountryData,
  clearCountryData,
  login,
  logout,
  setInsurance,
  setCookie,
  setMrzUser,
  setUserFormData,
  clearUserFormData,
  setCompanionFormData,
  clearCompanionFormData,
  setTokenValidation,
} = {
  ...purposeSlice.actions,
  ...hasDepartedSlice.actions,
  ...planSlice.actions,
  ...calendarSlice.actions,
  ...userSlice.actions,
  ...companionsSlice.actions,
  ...countrySlice.actions,
  ...authSlice.actions,
  ...insuranceSlice.actions,
  ...claimSlice.actions,
  ...cookieSlice.actions,
  ...userFormSlice.actions,
  ...companionFormSlice.actions,
};

// 필요한 액션들 별도로 export
export const { setKoreanName, setEnglishName, setEmail, setPhoneNumber } =
  personalInfoSlice.actions;
export const { setPriceData } = priceDataSlice.actions;
export const { setTotalPrice } = totalPriceSlice.actions;
export const { setBirthSecondPart } = claimSlice.actions;
export const { setPDFBlobs, clearPDFBlobs, setIsFromCsvUpload } =
  pdfSlice.actions;
export const { setAppType } = appStateSlice.actions;

// 빠져있는 setMembersData 액션 export 추가
export const { setMembersData } = membersDataSlice.actions;

// KLIP 인증 관련 액션들 export
export const {
  setKlipData,
  setProcessing,
  setAutoRefreshing,
  incrementRefreshCount,
  setLoginProcessing,
  setKlipError,
  clearKlipAuth,
} = klipAuthSlice.actions;

// 스토어 export
export default store;
