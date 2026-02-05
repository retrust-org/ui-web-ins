import React, { createContext, useState, useContext, useEffect } from "react";

const DisasterHouseContext = createContext();

// sessionStorage 키
const STORAGE_KEY = "disaster_house_data";

// 초기 상태 정의
const initialStates = {
  // 계약자 유형 (01: 개인, 02: 사업자)
  contractorType: "",

  // 사업자 정보
  businessData: {
    businessNumber: "",  // 사업자번호
    companyName: "",     // 상호명
    businessType: ""     // 업태/종목
  },

  // 본인인증 데이터
  authData: {
    athNo: "",
    name: "",
    birthdate: "",
    mobileno: ""
  },

  // 개인정보
  personalData: {
    name: "",
    residentFront: "",
    residentBack: "",
    residentBackLast: "",  // 주민번호 뒷자리 마지막 숫자 (마스킹 표시용)
    phonePrefix: "",
    phoneNumber: "",
    emailLocal: "",
    emailDomain: "",
    consumerType: "",
    encryptedFields: null
  },

  // 건물 정보
  buildingData: {
    siNm: "",
    sggNm: "",
    lctnAdr: "",           // 소재지
    houseType: "",         // 주택종류
    structure: "",         // 구조
    exclusiveArea: "",     // 전용면적
    grndFlrCnt: "",        // 지상층수
    ugrndFlrCnt: "",       // 지하층수
    pnu: "",               // 부동산고유번호
    titleInfo: null,
    unifiedApiData: null,  // 통합 API 응답 원본 캐싱
    bldgGrd: "",           // 건물등급
    earthquakeResistantDesign: "",  // 내진설계여부 (1: 예, 2: 아니요)
    opjbCd: ""             // 건물목적코드
  },

  // 시설/선택 정보 (소상공인과 호환성 유지)
  facilityData: {
    selectedDong: null,
    selectedFloorUnits: [],
    area: null,
    buildingUnitsData: null,
    exteriorWallType: "",
    unitCount: null,       // 가입세대수 (선택된 호실 수)
    buildingCost: null     // 건물 가격 정보 (building/area API에서 반환)
  },

  // 가입금액
  coverageAmounts: {
    bldgSbcAmt: 0,         // 건물 가입금액
    hhgdFntrSbcAmt: 0,     // 가재도구 가입금액
    activeFilter: "추천"
  },

  // 보험료 정보
  premiumData: null,

  // 계약 정보
  contractData: {
    prctrNo: "",           // 가계약번호
    rltLinkUrl1: "",       // 청약서 URL
    rltLinkUrl2: "",       // 약관 URL
    aplPrem: "",           // 총보험료
    indvBrdPrem: "",       // 본인부담 보험료
    govBrdPrem: "",        // 정부부담 보험료
    locgovBrdPrem: "",     // 지자체부담 보험료
    startDate: "",         // 보험시작일 (YYYYMMDD)
    endDate: ""            // 보험종료일 (YYYYMMDD)
  }
};

// sessionStorage에서 데이터 로드
const loadFromSessionStorage = () => {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error("sessionStorage 데이터 로드 오류:", error);
  }
  return null;
};

export const DisasterHouseProvider = ({ children }) => {
  // sessionStorage에서 초기 데이터 로드
  const savedData = loadFromSessionStorage();

  const [contractorType, setContractorType] = useState(
    savedData?.contractorType || initialStates.contractorType
  );

  const [businessData, setBusinessData] = useState(
    savedData?.businessData || initialStates.businessData
  );

  const [authData, setAuthData] = useState(
    savedData?.authData || initialStates.authData
  );

  const [personalData, setPersonalData] = useState(
    savedData?.personalData || initialStates.personalData
  );

  const [buildingData, setBuildingData] = useState(
    savedData?.buildingData || initialStates.buildingData
  );

  const [facilityData, setFacilityData] = useState(
    savedData?.facilityData || initialStates.facilityData
  );

  const [coverageAmounts, setCoverageAmounts] = useState(
    savedData?.coverageAmounts || initialStates.coverageAmounts
  );

  const [premiumData, setPremiumData] = useState(
    savedData?.premiumData || initialStates.premiumData
  );

  const [contractData, setContractData] = useState(
    savedData?.contractData || initialStates.contractData
  );

  // state 변경 시 sessionStorage에 자동 저장
  useEffect(() => {
    const dataToSave = {
      contractorType,
      businessData,
      authData,
      personalData,
      buildingData,
      facilityData,
      coverageAmounts,
      premiumData,
      contractData
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("sessionStorage 저장 오류:", error);
    }
  }, [
    contractorType,
    businessData,
    authData,
    personalData,
    buildingData,
    facilityData,
    coverageAmounts,
    premiumData,
    contractData
  ]);

  // 업데이트 함수들
  const updateContractorType = (type) => {
    setContractorType(type);
  };

  const updateBusinessData = (data) => {
    setBusinessData(prev => ({ ...prev, ...data }));
  };

  const updateAuthData = (data) => {
    setAuthData(prev => ({ ...prev, ...data }));
  };

  const updatePersonalData = (data) => {
    setPersonalData(prev => ({ ...prev, ...data }));
  };

  const updateBuildingData = (data) => {
    setBuildingData(prev => ({ ...prev, ...data }));
  };

  const updateFacilityData = (data) => {
    setFacilityData(prev => ({ ...prev, ...data }));
  };

  const updateCoverageAmounts = (amounts) => {
    setCoverageAmounts(prev => ({ ...prev, ...amounts }));
  };

  const updateContractData = (data) => {
    setContractData(prev => ({ ...prev, ...data }));
  };

  // 개인/사업자 구분
  const isPersonal = () => contractorType === "01";
  const isBusiness = () => contractorType === "02";

  // 전체 데이터 초기화
  const resetData = () => {
    setContractorType(initialStates.contractorType);
    setBusinessData(initialStates.businessData);
    setAuthData(initialStates.authData);
    setPersonalData(initialStates.personalData);
    setBuildingData(initialStates.buildingData);
    setFacilityData(initialStates.facilityData);
    setCoverageAmounts(initialStates.coverageAmounts);
    setPremiumData(initialStates.premiumData);
    setContractData(initialStates.contractData);

    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("sessionStorage 삭제 오류:", error);
    }
  };

  const value = {
    // 상태
    contractorType,
    businessData,
    authData,
    personalData,
    buildingData,
    facilityData,
    coverageAmounts,
    premiumData,
    contractData,
    // 업데이트 함수
    updateContractorType,
    updateBusinessData,
    updateAuthData,
    updatePersonalData,
    updateBuildingData,
    updateFacilityData,
    updateCoverageAmounts,
    setPremiumData,
    updateContractData,
    // 유틸리티 함수
    isPersonal,
    isBusiness,
    resetData
  };

  return (
    <DisasterHouseContext.Provider value={value}>
      {children}
    </DisasterHouseContext.Provider>
  );
};

export const useDisasterHouse = () => {
  const context = useContext(DisasterHouseContext);
  if (context === undefined) {
    throw new Error('useDisasterHouse must be used within a DisasterHouseProvider');
  }
  return context;
};

export default DisasterHouseContext;
