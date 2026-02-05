import React, { createContext, useState, useContext, useEffect } from "react";

const DisasterInsuranceContext = createContext();

// sessionStorage 키
const STORAGE_KEY = "disaster_insurance_data";

// 초기 상태 정의
const initialStates = {
  facilityData: {
    sfdgFclTpCd: "",
    owsDivCon: "",
    polhdCusTpCd: "",
    area: null,
    selectedFloorUnits: [],
    selectedBuildingType: "",
    selectedDong: null,  // 하위 호환성을 위해 유지 (단일 선택 시)
    selectedDongs: [],  // 여러 동 선택 (건물전체 선택 시)
    exteriorWallType: "",  // 외벽 타입
    buildingUnitsData: null  // building-units API 응답 원본 (호환성 유지)
  },
  businessData: {
    polhdNm: "",
    polhdBizpeNo: "",
    inspeNm: "",
    inspeBizpeNo: "",
    businessType: "",
    companyName: "",
    tngDivCd: null
  },
  buildingData: {
    siNm: "",
    sggNm: "",
    grndFlrCnt: "",
    ugrndFlrCnt: "",
    lctnAdr: "",
    titleInfo: null,
    pnu: "",  // 부동산고유번호 (19자리)
    unifiedApiData: null,  // 통합 API 응답 원본 캐싱
    bldgGrd: "",  // 건물등급 (1-4)
    earthquakeResistantDesign: ""  // 내진설계여부 (1: 예, 2: 아니요)
  },
  coverageAmounts: {
    bldgSbcAmt: 0, // 원 단위로 저장
    fclSbcAmt: 0, // 원 단위로 저장
    invnAsetSbcAmt: 0, // 원 단위로 저장
    instlMachSbcAmt: 0, // 원 단위로 저장
    activeFilter: "추천"
  },
  premiumData: null,
  personalData: {
    name: "",
    residentFront: "",
    residentBack: "",
    phonePrefix: "",
    phoneNumber: "",
    emailLocal: "",
    emailDomain: "",
    consumerType: ""
  },
  authData: {
    athNo: "",
    name: "",
    birthdate: "",
    mobileno: ""
  },
  contractData: {
    prctrNo: "",
    rltLinkUrl1: "",
    rltLinkUrl2: "",
    aplPrem: "",
    indvBrdPrem: "",
    govBrdPrem: "",
    locgovBrdPrem: "",
    startDate: "",    // YYYYMMDD 형식
    endDate: ""       // YYYYMMDD 형식 (startDate + 1년)
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

export const DisasterInsuranceProvider = ({ children }) => {
  // sessionStorage에서 초기 데이터 로드
  const savedData = loadFromSessionStorage();

  const [facilityData, setFacilityData] = useState(
    savedData?.facilityData || initialStates.facilityData
  );

  const [businessData, setBusinessData] = useState(
    savedData?.businessData || initialStates.businessData
  );

  const [buildingData, setBuildingData] = useState(
    savedData?.buildingData || initialStates.buildingData
  );

  const [coverageAmounts, setCoverageAmounts] = useState(
    savedData?.coverageAmounts || initialStates.coverageAmounts
  );

  const [premiumData, setPremiumData] = useState(
    savedData?.premiumData || initialStates.premiumData
  );

  const [personalData, setPersonalData] = useState(
    savedData?.personalData || initialStates.personalData
  );

  const [authData, setAuthData] = useState(
    savedData?.authData || initialStates.authData
  );

  const [contractData, setContractData] = useState(
    savedData?.contractData || initialStates.contractData
  );

  // state 변경 시 sessionStorage에 자동 저장
  useEffect(() => {
    const dataToSave = {
      facilityData,
      businessData,
      buildingData,
      coverageAmounts,
      premiumData,
      personalData,
      authData,
      contractData
    };

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (error) {
      console.error("sessionStorage 저장 오류:", error);
    }
  }, [
    facilityData,
    businessData,
    buildingData,
    coverageAmounts,
    premiumData,
    personalData,
    authData,
    contractData
  ]);

  const updateFacilityData = (data) => {
    setFacilityData(prev => ({ ...prev, ...data }));
  };

  const updatePersonalData = (data) => {
    setPersonalData(prev => ({ ...prev, ...data }));
  };

  const updateBusinessData = (data) => {
    setBusinessData(prev => ({ ...prev, ...data }));
  };

  const updateAuthData = (data) => {
    setAuthData(prev => ({ ...prev, ...data }));
  };

  const updateContractData = (data) => {
    setContractData(prev => ({ ...prev, ...data }));
  };

  const updateBuildingData = (data) => {
    setBuildingData(prev => ({ ...prev, ...data }));
  };

  const updateCoverageAmounts = (amounts) => {
    setCoverageAmounts(prev => ({ ...prev, ...amounts }));
  };


  // 소상인/소공인 구분 (tngDivCd: "20"=소상인, "40"=소공인)
  const isMerchant = () => businessData.tngDivCd === "20";

  // 사업장 소재지 계산 함수
  const getBusinessAddress = () => {
    let address = buildingData.lctnAdr || '-';

    // 1. 동/호수 정보 추가
    if (facilityData.selectedFloorUnits && facilityData.selectedFloorUnits.length > 0) {
      const locationInfo = facilityData.selectedFloorUnits.map(floorUnit => {
        const parts = [];
        if (floorUnit.dong && floorUnit.dong.trim() !== "") {
          parts.push(floorUnit.dong);
        }
        if (floorUnit.units && floorUnit.units.length > 0) {
          const hoList = floorUnit.units.map(unit => unit.hoNm).join(', ');
          parts.push(hoList);
        }
        return parts.join(' ');
      }).filter(item => item).join(', ');

      if (locationInfo) {
        address = `${address} ${locationInfo}`;
      }
    }
    else if (facilityData.selectedBuildingType === "total" && facilityData.selectedDong) {
      address += ` ${facilityData.selectedDong}`;
    }

    // 2. 마지막에 상호명 한 번만 추가
    if (businessData.companyName && businessData.companyName.trim() !== "") {
      address += ` ${businessData.companyName}`;
    }

    return address;
  };

  const resetData = () => {
    // 모든 state를 초기값으로 리셋
    setFacilityData(initialStates.facilityData);
    setBusinessData(initialStates.businessData);
    setBuildingData(initialStates.buildingData);
    setCoverageAmounts(initialStates.coverageAmounts);
    setPremiumData(initialStates.premiumData);
    setPersonalData(initialStates.personalData);
    setAuthData(initialStates.authData);
    setContractData(initialStates.contractData);

    // sessionStorage도 함께 삭제
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error("sessionStorage 삭제 오류:", error);
    }
  };

  const value = {
    facilityData,
    businessData,
    buildingData,
    coverageAmounts,
    premiumData,
    personalData,
    authData,
    contractData,
    updateFacilityData,
    updateBusinessData,
    updateBuildingData,
    updateCoverageAmounts,
    setPremiumData,
    updatePersonalData,
    updateAuthData,
    updateContractData,
    resetData,
    getBusinessAddress,
    isMerchant
  };

  return (
    <DisasterInsuranceContext.Provider value={value}>
      {children}
    </DisasterInsuranceContext.Provider>
  );
};

export const useDisasterInsurance = () => {
  const context = useContext(DisasterInsuranceContext);
  if (context === undefined) {
    throw new Error('useDisasterInsurance must be used within a DisasterInsuranceProvider');
  }
  return context;
};

export default DisasterInsuranceContext;