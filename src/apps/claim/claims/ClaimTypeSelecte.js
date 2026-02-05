import React, { useState, useEffect } from "react";
import styles from "../../../css/claim/claimTypeSelect.module.css";
import commonRadioBtn from "../../../assets/commonRadioBtn.svg";
import commonRadinActive from "../../../assets/commonRadinActive.svg";
import { useNavigate } from "react-router-dom";
import ClaimButton from "../../../components/buttons/ClaimButton";
import OptionContainer from "../../../components/inputs/OptionContainr";
import ClaimMemberData from "../../../data/ClaimMemberData.json";
import ClaimHeader from "../components/ClaimHeader";
import { useClaimUploadContext } from "../../../context/ClaimUploadContext";

function ClaimTypeSelect() {
  const navigate = useNavigate();
  const {
    saveSelectedDate,
    saveTypeSelectedData,
    claimData,
    typeSelectedData,
  } = useClaimUploadContext();

  // 보험 상품 관련 상태
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isNextButtonDisabled, setIsNextButtonDisabled] = useState(true);

  // ClaimMemberData에서 필요한 데이터 추출
  const clmTpCd = ClaimMemberData.clmTpCd;
  const acdCausLctgCd = ClaimMemberData.acdCausLctgCd;

  // 청구 유형을 위한 데이터
  const cladjOpapiRctDivCd = {
    1: "신규",
    2: "추가",
  };

  const [isActive, setIsActive] = useState(1);

  // 고정된 보험 상품 목록
  const predefinedProducts = [
    "국내여행보험",
    "해외여행 의료비실손보험",
    "해외장기체류보험",
  ];

  // 선택된 값 관리 (모든 여행 유형에 통일 적용)
  const [selectedValues, setSelectedValues] = useState({
    clmTpCd: null, // 사고 종류 (값)
    subClmTpCd: null, // 사고 원인 (값)
  });

  // 선택된 키 관리
  const [claimTypeKey, setClaimTypeKey] = useState(null); // 사고 종류 키
  const [accidentCauseKey, setAccidentCauseKey] = useState(null); // 사고 원인 키

  // Context에서 기존 값 복원
  useEffect(() => {
    if (claimData?.product_name) {
      setSelectedProduct(claimData.product_name);
    }

    if (typeSelectedData?.clmTpCd) {
      setSelectedValues((prev) => ({
        ...prev,
        clmTpCd: typeSelectedData.clmTpCd,
      }));
      setClaimTypeKey(typeSelectedData.claimTypeKey);
    }

    if (typeSelectedData?.subClmTpCd) {
      setSelectedValues((prev) => ({
        ...prev,
        subClmTpCd: typeSelectedData.subClmTpCd,
      }));
      setAccidentCauseKey(typeSelectedData.accidentCauseKey);
    }

    if (typeSelectedData?.claimType) {
      setIsActive(parseInt(typeSelectedData.claimType));
    }
  }, [claimData, typeSelectedData]);

  useEffect(() => {
    if (
      selectedProduct &&
      selectedValues.clmTpCd &&
      selectedValues.subClmTpCd
    ) {
      setIsNextButtonDisabled(false);
    } else {
      setIsNextButtonDisabled(true);
    }
  }, [selectedProduct, selectedValues]);

  // 청구 유형 선택 핸들러
  const handleOptionClick = (key) => {
    setIsActive(key);
  };

  // 보험 상품 선택 핸들러
  const handleProductSelect = (productName) => {
    setSelectedProduct(productName);

    // 새로운 상품 선택 시 사고 종류/원인 초기화
    setSelectedValues({
      clmTpCd: null,
      subClmTpCd: null,
    });
    setClaimTypeKey(null);
    setAccidentCauseKey(null);
  };

  // 사고 종류 선택 핸들러
  const selectClmTpCd = (clmTpCdKey) => {
    const clmTpCdValue = clmTpCd[clmTpCdKey];

    setSelectedValues((prev) => ({
      ...prev,
      clmTpCd: clmTpCdValue,
      subClmTpCd: null, // 사고 종류가 변경되면 사고 원인 초기화
    }));
    setClaimTypeKey(clmTpCdKey); // 사고 종류 키 저장
    setAccidentCauseKey(null); // 사고 원인 키 초기화
  };

  // 사고 원인 선택 핸들러
  const selectSubClmTpCd = (subClmTpCdKey) => {
    const subClmTpCdValue =
      acdCausLctgCd[selectedValues.clmTpCd][subClmTpCdKey];

    setSelectedValues((prev) => ({
      ...prev,
      subClmTpCd: subClmTpCdValue,
    }));
    setAccidentCauseKey(subClmTpCdKey); // 사고 원인 키 저장
  };

  // 다음 단계로 이동하는 핸들러
  const handleNextClick = () => {
    if (!selectedProduct) {
      alert("보험 상품을 선택해주세요.");
      return;
    }

    if (!selectedValues.clmTpCd) {
      alert("사고 종류를 선택해주세요.");
      return;
    }

    if (!selectedValues.subClmTpCd) {
      alert("사고 원인을 선택해주세요.");
      return;
    }

    try {
      // Context에 필요한 데이터 저장
      const dataToSave = {
        claimType: isActive.toString(),
        product_name: selectedProduct, // 선택된 상품명
      };

      saveSelectedDate(dataToSave);

      // 사고 종류/원인 정보 저장 (모든 상품에 저장)
      const typeData = {
        claimType: isActive.toString(),
        claimTypeKey: claimTypeKey, // 사고 종류 키 (예: "1")
        accidentCauseKey: accidentCauseKey, // 사고 원인 키 (예: "101")
        clmTpCd: selectedValues.clmTpCd, // 사고 종류 값 (예: "상해")
        subClmTpCd: selectedValues.subClmTpCd, // 사고 원인 값 (예: "일반상해")
        selectedProduct: selectedProduct,
      };

      saveTypeSelectedData(typeData);

      // 다음 페이지로 이동
      navigate("/claimSelectDate");
    } catch (error) {
      console.error("페이지 이동 중 오류 발생:", error);
      alert("페이지 이동 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.claimContainer}>
      <ClaimHeader titleText="청구하기" />
      <div className={styles.section_2}>
        <h1>청구유형을 선택해주세요.</h1>
        <div className={`${styles.sectionContentsWrap}`}>
          {/* 청구 선택 UI 추가 */}
          <div className={`${styles.sectionContentsWrap_claimSelect}`}>
            <div className={`${styles.sectionContentsWrap_claimSelectOption}`}>
              <ul>
                {Object.entries(cladjOpapiRctDivCd).map(([key, value]) => (
                  <li
                    key={key}
                    onClick={() => handleOptionClick(parseInt(key))}
                    style={{
                      display: "flex",
                      gap: "8px",
                      cursor: "pointer",
                      alignItems: "center",
                    }}
                  >
                    <img
                      src={
                        isActive === parseInt(key)
                          ? commonRadinActive
                          : commonRadioBtn
                      }
                      alt="radio button"
                    />
                    <p
                      style={{
                        color:
                          isActive === parseInt(key) ? "#386937" : "#1b1e28",
                        fontSize: "14px",
                        fontWeight: 500,
                        lineHeight: "20px",
                      }}
                    >
                      {value}
                    </p>
                  </li>
                ))}
              </ul>
              <div className={styles.options}>
                {/* 보험 상품 선택 OptionContainer - 고정된 목록 사용 */}
                <OptionContainer
                  title="보험상품"
                  items={predefinedProducts}
                  initialSelectedItem={selectedProduct} // Context에서 복원된 값 전달
                  onChange={(isActive) => {
                    if (!isActive) {
                      setSelectedProduct(null);
                      setIsNextButtonDisabled(true);
                    }
                  }}
                  onItemSelect={handleProductSelect}
                />

                {/* 사고 종류 선택 - 보험상품이 선택된 경우에만 표시 */}
                {selectedProduct && (
                  <OptionContainer
                    title="사고종류"
                    items={Object.values(clmTpCd)}
                    initialSelectedItem={selectedValues.clmTpCd} // Context에서 복원된 값 전달
                    onChange={(isActive) => {
                      if (!isActive) {
                        setSelectedValues((prev) => ({
                          ...prev,
                          clmTpCd: null,
                          subClmTpCd: null,
                        }));
                        setClaimTypeKey(null);
                        setAccidentCauseKey(null);
                      }
                    }}
                    onItemSelect={(item) => {
                      const key = Object.keys(clmTpCd).find(
                        (k) => clmTpCd[k] === item
                      );
                      selectClmTpCd(key);
                    }}
                  />
                )}

                {/* 사고 원인 선택 - 사고 종류가 선택된 경우에만 표시 */}
                {selectedProduct && selectedValues.clmTpCd && (
                  <OptionContainer
                    title="사고원인"
                    items={Object.values(
                      acdCausLctgCd[selectedValues.clmTpCd] || {}
                    )}
                    initialSelectedItem={selectedValues.subClmTpCd} // Context에서 복원된 값 전달
                    onChange={(isActive) => {
                      if (!isActive) {
                        setSelectedValues((prev) => ({
                          ...prev,
                          subClmTpCd: null,
                        }));
                        setAccidentCauseKey(null);
                      }
                    }}
                    onItemSelect={(item) => {
                      const key = Object.keys(
                        acdCausLctgCd[selectedValues.clmTpCd]
                      ).find(
                        (k) => acdCausLctgCd[selectedValues.clmTpCd][k] === item
                      );
                      selectSubClmTpCd(key);
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 버튼 영역 */}
        <div className={styles.buttonContainer}>
          <ClaimButton
            buttonText="확인"
            onClick={handleNextClick}
            disabled={isNextButtonDisabled}
          />
        </div>
      </div>
    </div>
  );
}

export default ClaimTypeSelect;
