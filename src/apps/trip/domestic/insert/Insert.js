import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "../../../../components/buttons/Button";
import InsertDate from "./InsertDate";
import Gender from "./Gender";
import styles from "../../../../css/trip/insert.module.css";
import CalcExcel from "../../components/CalcExcel";
import {
  setKoreanName,
  setEnglishName,
  setEmail,
  setPhoneNumber,
  setGender,
  setDateOfBirth,
  setCompanions,
  setIsFromCsvUpload,
  selectStartDate,
  selectEndDate,
} from "../../../../redux/store";
import { formatPhoneNumber } from "../../../../utils/regex";
import Loading from "../../../../components/loadings/Loading";
import ActiveChkBtn from "../../../../assets/commonActiveChk.svg";
import ChkBtn from "../../../../assets/commonCheck.svg";

// 국내여행 insert페이지
function Insert({ faRetrustData }) {
  const dispatch = useDispatch();
  const startDate = useSelector((state) => state.calendar.selectedStartDate);
  const endDate = useSelector((state) => state.calendar.selectedEndDate);
  const gender = useSelector((state) => state.user.gender);
  const dateOfBirth = useSelector((state) => state.user.dateOfBirth);
  const companions = useSelector((state) => state.companions);
  const isFromCsvUpload = useSelector((state) => state.pdf.isFromCsvUpload);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [shouldResetCalcExcel, setShouldResetCalcExcel] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  // 세션스토리지에서 토글 상태 복원 함수
  const getStoredToggleState = () => {
    try {
      const stored = sessionStorage.getItem("isDomesticExcelMode");
      return stored === "true";
    } catch (error) {
      console.warn("세션스토리지 읽기 실패:", error);
      return false;
    }
  };

  const [isExcelMode, setIsExcelMode] = useState(getStoredToggleState);

  // 세션스토리지에 토글 상태 저장 함수
  const saveToggleStateToStorage = (isExcel) => {
    try {
      sessionStorage.setItem("isDomesticExcelMode", isExcel.toString());
    } catch (error) {
      console.warn("세션스토리지 저장 실패:", error);
    }
  };

  // CalcExcel 관련 세션스토리지 초기화 함수
  const resetCalcExcelStorage = () => {
    sessionStorage.removeItem("calcExcel_userData");
    sessionStorage.removeItem("calcExcel_fileName");
    sessionStorage.removeItem("calcExcel_status");
    sessionStorage.removeItem("indemnity_csvData");
    sessionStorage.removeItem("reduxState");
  };

  // Redux 초기화 함수
  const resetReduxData = useCallback(() => {
    dispatch(selectStartDate(null));
    dispatch(selectEndDate(null));
    dispatch(setGender(""));
    dispatch(setDateOfBirth(""));
    dispatch(setCompanions([]));
    dispatch(setKoreanName(""));
    dispatch(setEnglishName(""));
    dispatch(setEmail(""));
    dispatch(setPhoneNumber(""));
    dispatch(setIsFromCsvUpload(false));
  }, [dispatch]);

  // 로컬 상태 초기화 함수
  const resetLocalData = useCallback(() => {
    setUserData(null);
    setErrorMessage("");
  }, []);

  // 데이터가 입력되어 있는지 확인하는 함수
  const hasInputData = useCallback(() => {
    // 직접입력 데이터 확인
    const hasDirectInput =
      startDate || endDate || gender || dateOfBirth || companions.length > 0;

    // 엑셀 업로드 데이터 확인
    const hasExcelData = userData !== null;

    return hasDirectInput || hasExcelData;
  }, [startDate, endDate, gender, dateOfBirth, companions, userData]);

  // 컴포넌트 마운트 시 상태 동기화
  useEffect(() => {
    const storedToggleState = getStoredToggleState();
    setIsExcelMode(storedToggleState);

    if (storedToggleState && !isFromCsvUpload) {
      dispatch(setIsFromCsvUpload(true));
    } else if (!storedToggleState && isFromCsvUpload) {
      dispatch(setIsFromCsvUpload(false));
    }

    if (!startDate && !endDate && !gender && !dateOfBirth) {
      resetLocalData();
    }
  }, []);

  // 다음 버튼 핸들러
  const handleNext = async () => {
    setIsNavigating(true);

    try {
      saveToggleStateToStorage(isExcelMode);

      if (!isExcelMode) {
        // 직접입력 모드
        await new Promise((resolve) => setTimeout(resolve, 300));
        navigate("/indemnity");
      } else {
        // 엑셀업로드 모드
        if (userData && userData.contractor) {
          const { contractor, companions: excelCompanions } = userData;

          // 계약자 정보를 Redux에 저장
          dispatch(setKoreanName(contractor.koreanName || ""));
          dispatch(setEnglishName(contractor.englishName || ""));
          dispatch(setEmail(contractor.email || ""));
          dispatch(
            setPhoneNumber(formatPhoneNumber(contractor.phoneNumber || ""))
          );

          // 성별 처리 (한글 -> 코드 변환)
          const genderCode =
            contractor.gender === "남"
              ? "1"
              : contractor.gender === "여"
                ? "2"
                : contractor.gender;
          dispatch(setGender(genderCode));

          // 생년월일 처리
          if (contractor.birthDate && contractor.birthDate.length === 8) {
            dispatch(setDateOfBirth(contractor.birthDate));
          }

          // 동반자 정보 처리
          if (excelCompanions && excelCompanions.length > 0) {
            const companionData = excelCompanions.map((companion) => {
              const companionGenderCode =
                companion.gender === "남"
                  ? "1"
                  : companion.gender === "여"
                    ? "2"
                    : companion.gender;

              return {
                koreanName: companion.koreanName || "",
                englishName: companion.englishName || "",
                email: companion.email || "",
                phoneNumber: formatPhoneNumber(companion.phoneNumber || ""),
                gender: companionGenderCode,
                dateOfBirth: companion.birthDate || "",
              };
            });
            dispatch(setCompanions(companionData));
          } else {
            dispatch(setCompanions([]));
          }

          // CSV 업로드 플래그 설정
          dispatch(setIsFromCsvUpload(true));

          console.log("Domestic Redux data updated successfully");
        }

        await new Promise((resolve) => setTimeout(resolve, 300));
        navigate("/indemnity");
      }
    } catch (error) {
      console.error("Navigation error:", error);
      setErrorMessage("페이지 이동 중 오류가 발생했습니다.");
    } finally {
      setIsNavigating(false);
    }
  };

  const companionsInfoValid = companions.every(
    (companion) =>
      companion.gender &&
      companion.dateOfBirth &&
      companion.dateOfBirth.length === 8
  );

  const isDateOfBirthValid = dateOfBirth && dateOfBirth.length === 8;

  // 엑셀 업로드 데이터 유효성 검사
  const isExcelDataValid = () => {
    if (!userData || !userData.contractor) return false;

    const contractor = userData.contractor;

    // 국내여행: 이름, 생년월일, 성별만 필수
    const contractorValid =
      contractor.koreanName && contractor.gender && contractor.birthDate;

    const companionsValid =
      !userData.companions ||
      userData.companions.length === 0 ||
      userData.companions.every(
        (companion) =>
          companion.koreanName && companion.gender && companion.birthDate
      );

    return contractorValid && companionsValid;
  };

  // 버튼 비활성화 조건
  const isButtonDisabled = () => {
    if (!startDate || !endDate || isNavigating) return true;

    if (!isExcelMode) {
      // 직접입력 모드
      return (
        !gender ||
        !dateOfBirth ||
        !companionsInfoValid ||
        !isDateOfBirthValid ||
        errorMessage
      );
    } else {
      // 엑셀업로드 모드
      return !isExcelDataValid();
    }
  };

  // 토글 버튼 핸들러
  const handleToggle = () => {
    // 데이터가 있는 경우 confirm 창 표시
    if (hasInputData()) {
      const confirmed = window.confirm("방법 변경시 기존데이터는 삭제됩니다");
      if (!confirmed) {
        return; // 사용자가 취소한 경우 토글하지 않음
      }
    }

    const newExcelMode = !isExcelMode;

    resetReduxData();
    resetLocalData();
    resetCalcExcelStorage(); // CalcExcel 관련 세션스토리지 초기화
    setIsExcelMode(newExcelMode);
    saveToggleStateToStorage(newExcelMode);
    setShouldResetCalcExcel(true);

    dispatch(setIsFromCsvUpload(newExcelMode));
  };

  const renderContent = () => {
    if (isExcelMode) {
      return (
        <CalcExcel
          faRetrustData={faRetrustData}
          onDataChange={setUserData}
          selectedCountry="한국" // 국내여행은 한국 고정
          setSelectedCountry={() => { }} // 국내여행은 변경 불가
          shouldReset={shouldResetCalcExcel}
          key={`excel-${shouldResetCalcExcel}`}
        />
      );
    }

    return (
      <div className={styles.tripSelect}>
        <p className={styles.calendars}>여행 일정</p>
        <InsertDate faRetrustData={faRetrustData} />
        <Gender
          faRetrustData={faRetrustData}
          errorMessage={errorMessage}
          setErrorMessage={setErrorMessage}
        />
      </div>
    );
  };

  useEffect(() => {
    if (shouldResetCalcExcel) {
      setShouldResetCalcExcel(false);
    }
  }, [shouldResetCalcExcel]);

  return (
    <div className={styles.container}>
      {isNavigating && <Loading />}
      <div className={styles.containerWrap}>
        <div className={styles.titltBox}>
          <div className={styles.titltWrap}>
            <h2 className={styles.title}>
              <span style={{ color: "#386937" }}>보험료 계산</span>
              에 필요한 정보를
              <br /> 입력해주세요
            </h2>
            <div className={styles.tabContainer}>
              <div className={styles.buttonWrap}>
                <button
                  className={`${styles.toggleButton} ${isExcelMode ? styles.activeToggle : ""
                    }`}
                  onClick={handleToggle}
                >
                  <img
                    src={isExcelMode ? ActiveChkBtn : ChkBtn}
                    alt="check button"
                  />
                  <p>엑셀로 한번에 단체가입하기</p>
                </button>
              </div>
              <div className={styles.tabContent}>{renderContent()}</div>
            </div>
          </div>
        </div>
        <Button
          buttonText="다음"
          onClick={handleNext}
          disabled={isButtonDisabled()}
        />
      </div>
    </div>
  );
}
export default Insert;
