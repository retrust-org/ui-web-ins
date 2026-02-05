import React, { useState, useEffect } from "react";
import styles from "../../../../css/disasterSafeguard/workPlaceinfo.module.css";
import optionChk from "../../../../assets/DownChk.svg";
import WorkPlaceMenuList from "../../components/WorkPlaceMenuList";
import SafetyButton from "../../../../components/buttons/SafetyButton";
import DisasterHeader from "../../../../components/headers/DisasterHeader";
import { useNavigate } from "react-router-dom";
import { useDisasterInsurance } from "../../../../context/DisasterInsuranceContext";
import { useSessionState } from "../../hooks/useSessionState";
import ErrorModal from "../../../../components/modals/ErrorModal";
import Loading from "../../../../components/loadings/Loading";
import { verifyBusinessNumber, checkVerificationResult, getBusinessErrorMessage } from "../../services/businessVerificationService";

function Information() {
  const navigate = useNavigate();
  const { businessData, updateBusinessData } = useDisasterInsurance();

  // sessionStorage에서 복원된 값으로 자동 초기화
  const [isActive, setIsActive] = useSessionState(
    businessData.tngDivCd === "20" ? "소상인" : businessData.tngDivCd === "40" ? "소공인" : null,
    null
  );
  const [selectedMenu, setSelectedMenu] = useSessionState(businessData.businessType, "");
  const [businessNumber, setBusinessNumber] = useSessionState(
    businessData.polhdBizpeNo
      ? `${businessData.polhdBizpeNo.substring(0, 3)}-${businessData.polhdBizpeNo.substring(3, 5)}-${businessData.polhdBizpeNo.substring(5)}`
      : "",
    ""
  );
  const [companyName, setCompanyName] = useSessionState(businessData.companyName, "");
  const [showModal, setShowModal] = useState(false);

  // 사업자 검증 상태
  const [isVerifying, setIsVerifying] = useState(false);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: "" });

  // 사업자 등록번호 형식 변환 (xxx-xx-xxxxx)
  const handleBusinessNumber = (e) => {
    const value = e.target.value.replace(/[^0-9]/g, ""); // 숫자만 추출

    // 10자리까지만 입력 가능
    if (value.length > 10) {
      return;
    }

    let formattedValue = "";
    if (value.length > 0) {
      // 첫 3자리
      formattedValue = value.substring(0, 3);

      // 4~5번째 자리 (하이픈 추가)
      if (value.length >= 4) {
        formattedValue += "-" + value.substring(3, 5);
      }

      // 6~10번째 자리 (하이픈 추가)
      if (value.length >= 6) {
        formattedValue += "-" + value.substring(5, 10);
      }
    }

    setBusinessNumber(formattedValue);
  };

  // 옵션 토글 핸들러
  const selectedOption = (option) => {
    const newValue = isActive === option ? null : option;
    setIsActive(newValue);
    // 소상인/소공인 변경 시 업태종목 초기화
    if (newValue !== isActive) {
      setSelectedMenu("");
    }
  };

  // 모달 열기 핸들러
  const openModal = () => {
    // 소상인/소공인이 선택되지 않았다면 알림 표시
    if (!isActive) {
      alert("사업자 유형을 선택해주세요");
      return;
    }
    setShowModal(true);
  };

  // 모달 닫기 핸들러
  const closeModal = () => {
    setShowModal(false);
  };

  // 메뉴 아이템 선택 핸들러
  const handleMenuSelect = (item) => {
    setSelectedMenu(item);
  };

  // 입력값이 변경될 때마다 Context에 자동 저장
  useEffect(() => {
    // 사업자번호에서 하이픈 제거
    const cleanBusinessNumber = businessNumber.replace(/-/g, '');

    // 소상인/소공인에 따라 tngDivCd 결정
    const tngDivCd = isActive === "소상인" ? "20" : isActive === "소공인" ? "40" : null;

    // Context에 저장할 사업자 데이터 (변경된 값만 즉시 저장)
    const updatedBusinessData = {
      polhdNm: companyName.trim(),
      polhdBizpeNo: cleanBusinessNumber,
      inspeNm: companyName.trim(),
      inspeBizpeNo: cleanBusinessNumber,
      businessType: selectedMenu.trim(),
      companyName: companyName.trim(),
      tngDivCd: tngDivCd
    };

    // Context에 즉시 저장 (sessionStorage에 자동 저장됨)
    updateBusinessData(updatedBusinessData);
  }, [businessNumber, companyName, isActive, selectedMenu, updateBusinessData]);

  const nextBtn = async () => {
    // 입력값 검증
    if (!companyName.trim()) {
      alert("상호명을 입력해주세요");
      return;
    }
    if (!businessNumber.trim()) {
      alert("사업자 등록번호를 입력해주세요");
      return;
    }
    if (!isActive) {
      alert("사업자 유형(소상인/소공인)을 선택해주세요");
      return;
    }

    // 사업자번호에서 하이픈 제거
    const cleanBusinessNumber = businessNumber.replace(/-/g, '');

    // 사업자번호 길이 검증
    if (cleanBusinessNumber.length !== 10) {
      alert("사업자 등록번호 10자리를 입력해주세요");
      return;
    }

    try {
      setIsVerifying(true);

      // 사업자번호 검증 API 호출
      const response = await verifyBusinessNumber(cleanBusinessNumber, companyName.trim());

      // 검증 결과 확인
      const result = checkVerificationResult(response);

      if (!result.isValid) {
        // 검증 실패 - 에러 모달 표시
        const errorMessage = getBusinessErrorMessage(
          result.errorCode,
          result.errorMessage
        );

        setErrorModal({
          isOpen: true,
          message: errorMessage
        });

        return;
      }

      // 검증 성공 - 소상인/소공인에 따라 tngDivCd 결정
      const tngDivCd = isActive === "소상인" ? "20" : "40";

      // Context에 저장할 사업자 데이터
      const businessData = {
        polhdNm: companyName.trim(),
        polhdBizpeNo: cleanBusinessNumber,
        inspeNm: companyName.trim(),
        inspeBizpeNo: cleanBusinessNumber,
        businessType: selectedMenu.trim(),  // 업태/종목
        companyName: companyName.trim(),    // 회사명
        tngDivCd: tngDivCd                  // 물건구분코드 (20:소상인, 40:소공인)
      };

      // Context에 데이터 저장
      updateBusinessData(businessData);

      // 다음 페이지로 이동 (날짜 선택 페이지)
      navigate("/insuranceDate");

    } catch (error) {
      console.error("사업자번호 검증 오류:", error);
      setErrorModal({
        isOpen: true,
        message: "사업자번호 검증 중 오류가 발생했습니다.\n다시 시도해주세요."
      });
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <>
      {isVerifying && <Loading />}
      {errorModal.isOpen && (
        <ErrorModal
          message={errorModal.message}
          onClose={() => setErrorModal({ isOpen: false, message: "" })}
        />
      )}
      <DisasterHeader title="실손보상 소상공인 풍수해·지진재해보험" />
      <div id={styles.container}>
        <section className={styles.formSection}>
          <h2>사업장 정보를 입력해주세요</h2>
          <div className={styles.form}>
            <div className={styles.formContents}>
              <input
                type="text"
                placeholder="사업자 등록 번호를 입력해주세요"
                value={businessNumber}
                onChange={handleBusinessNumber}
                maxLength={12} // xxx-xx-xxxxx 형식으로 최대 12자
              />
              <input
                type="text"
                placeholder="상호명을 입력해주세요"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
              />
              <div className={styles.optionType}>
                <ul>
                  <li
                    className={isActive === "소상인" ? styles.active : ""}
                    onClick={() => selectedOption("소상인")}
                  >
                    소상인
                  </li>
                  <li
                    className={isActive === "소공인" ? styles.active : ""}
                    onClick={() => selectedOption("소공인")}
                  >
                    소공인
                  </li>
                </ul>
              </div>
              <div className={styles.optionMenu} onClick={openModal}>
                <div className={styles.optionMenuList}>
                  <p className={selectedMenu ? styles.selected : ""}>
                    {selectedMenu || "업태/종목"}
                  </p>
                  <img src={optionChk} alt="optionChk" />
                </div>
              </div>
            </div>
          </div>
        </section>
        <SafetyButton buttonText="다음으로" onClick={nextBtn} />
      </div>

      {/* 모달 컴포넌트 */}
      {showModal && (
        <WorkPlaceMenuList
          businessType={isActive}
          onSelect={handleMenuSelect}
          onClose={closeModal}
        />
      )}
    </>
  );
}

export default Information;
