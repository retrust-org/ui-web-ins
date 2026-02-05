// src/contexts/ClaimUploadContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

// Context 생성
const ClaimUploadContext = createContext();

// sessionStorage 키 (짧게 명명)
const KEYS = {
  claim: "cl_data",
  insured: "ins_data",
  type: "type_data",
  accept: "acc_data",
  receipt: "rec_type",
  user: "user_name",
  contract: "con_data",
};

// sessionStorage 헬퍼
const storage = {
  get: (key) => {
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch {
      return null;
    }
  },
  set: (key, value) => {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error("Storage set error:", error);
    }
  },
  remove: (key) => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error("Storage remove error:", error);
    }
  },
};

// Provider 컴포넌트
export const ClaimUploadProvider = ({ children }) => {
  const [claimData, setClaimData] = useState({});
  const [insuredData, setInsuredData] = useState({});
  const [typeSelectedData, setTypeSelectedData] = useState({});
  const [acceptData, setAcceptData] = useState({});
  const [receiptType, setReceiptType] = useState(null);
  const [userName, setUserName] = useState(null);
  const [allContractData, setAllContractData] = useState(null);

  // 초기 로드 시 sessionStorage에서 데이터 복원
  useEffect(() => {
    setClaimData(storage.get(KEYS.claim) || {});
    setInsuredData(storage.get(KEYS.insured) || {});
    setTypeSelectedData(storage.get(KEYS.type) || {});
    setAcceptData(storage.get(KEYS.accept) || {});
    setReceiptType(storage.get(KEYS.receipt));
    setUserName(storage.get(KEYS.user));
    setAllContractData(storage.get(KEYS.contract));
  }, []);

  // 청구 데이터 저장 함수
  const saveSelectedDate = (data) => {
    if (data) {
      setClaimData((prevData) => {
        const newData = { ...prevData, ...data };
        storage.set(KEYS.claim, newData);
        return newData;
      });
    }
  };

  // 피보험자 데이터를 저장하는 함수
  const saveInsuredData = (data) => {
    if (data) {
      setInsuredData((prevData) => {
        const newData = { ...prevData, ...data };
        storage.set(KEYS.insured, newData);
        return newData;
      });
    }
  };

  // 청구 유형 데이터를 저장하는 함수
  const saveTypeSelectedData = (data) => {
    if (data) {
      setTypeSelectedData((prevData) => {
        const newData = { ...prevData, ...data };
        storage.set(KEYS.type, newData);
        return newData;
      });
    }
  };

  // 사고 접수 데이터를 저장하는 함수
  const saveAcceptData = (data) => {
    if (data) {
      setAcceptData((prevData) => {
        const newData = { ...prevData, ...data };
        storage.set(KEYS.accept, newData);
        return newData;
      });
    }
  };

  // 접수 유형 저장 전용 함수
  const setSelectedReceiptType = (type) => {
    setReceiptType(type);
    storage.set(KEYS.receipt, type);
  };

  // 접수 유형에 따른 사용자명 저장 함수
  const setSelectedUserName = (name) => {
    setUserName(name);
    storage.set(KEYS.user, name);
  };

  // 접수 유형과 사용자명을 함께 저장하는 함수
  const saveReceiptTypeAndUserName = (type, name) => {
    setReceiptType(type);
    setUserName(name);
    storage.set(KEYS.receipt, type);
    storage.set(KEYS.user, name);
  };

  // allContract 결과값 저장 함수
  const saveAllContractData = (data) => {
    setAllContractData(data);
    storage.set(KEYS.contract, data);
  };

  // 접수 유형이 본인청구인지 확인하는 헬퍼 함수
  const isSelfClaim = () => receiptType === "self";

  // 접수 유형이 미성년 자녀 청구인지 확인하는 헬퍼 함수
  const isMinorChildClaim = () => receiptType === "minorChild";

  // 접수 유형 변경 시 관련 데이터 초기화 함수
  const resetRelatedData = () => {
    const emptyInsured = {};
    const emptyAccept = {};

    setInsuredData(emptyInsured);
    setAcceptData(emptyAccept);
    setAllContractData(null);

    storage.set(KEYS.insured, emptyInsured);
    storage.set(KEYS.accept, emptyAccept);
    storage.remove(KEYS.contract);
  };

  // 전체 데이터 초기화 함수
  const resetAllData = () => {
    setClaimData({});
    setInsuredData({});
    setTypeSelectedData({});
    setAcceptData({});
    setReceiptType(null);
    setUserName(null);
    setAllContractData(null);

    // sessionStorage에서도 모든 데이터 제거
    Object.values(KEYS).forEach((key) => storage.remove(key));
  };

  // 접수 유형별 관련 데이터만 초기화하는 함수
  const resetInsuredAndAcceptData = () => {
    const emptyInsured = {};
    const emptyAccept = {};

    setInsuredData(emptyInsured);
    setAcceptData(emptyAccept);
    setAllContractData(null);

    storage.set(KEYS.insured, emptyInsured);
    storage.set(KEYS.accept, emptyAccept);
    storage.remove(KEYS.contract);
  };

  return (
    <ClaimUploadContext.Provider
      value={{
        claimData,
        saveSelectedDate,
        insuredData,
        saveInsuredData,
        typeSelectedData,
        saveTypeSelectedData,
        acceptData,
        saveAcceptData,
        receiptType,
        setSelectedReceiptType,
        userName,
        setSelectedUserName,
        saveReceiptTypeAndUserName,
        allContractData,
        saveAllContractData,
        isSelfClaim,
        isMinorChildClaim,
        resetRelatedData,
        resetAllData,
        resetInsuredAndAcceptData,
      }}
    >
      {children}
    </ClaimUploadContext.Provider>
  );
};

// 커스텀 훅
export const useClaimUploadContext = () => {
  return useContext(ClaimUploadContext);
};

export default ClaimUploadProvider;
