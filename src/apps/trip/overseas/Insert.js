import React, { useState, useEffect, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/buttons/Button";
import InsertDate from "./InsertDate";
import Gender from "./Gender";
import styles from "../../../css/trip/insert.module.css";
import CalcExcel from "../components/CalcExcel";
import CityInfoData from "../../../data/CityinfoData.json";
import {
  setKoreanName,
  setEnglishName,
  setEmail,
  setPhoneNumber,
  setGender,
  setDateOfBirth,
  setCompanions,
  setIsFromCsvUpload,
  setSelectedCountryData,
  selectStartDate,
  selectEndDate,
} from "../../../redux/store";
import { formatPhoneNumber } from "../../../utils/regex";
import Loading from "../../../components/loadings/Loading";
import ActiveChkBtn from "../../../assets/commonActiveChk.svg";
import ChkBtn from "../../../assets/commonCheck.svg";

function Insert({ faRetrustData }) {
  const dispatch = useDispatch();
  const startDate = useSelector((state) => state.calendar.selectedStartDate);
  const endDate = useSelector((state) => state.calendar.selectedEndDate);
  const gender = useSelector((state) => state.user.gender);
  const dateOfBirth = useSelector((state) => state.user.dateOfBirth);
  const companions = useSelector((state) => state.companions);
  const isFromCsvUpload = useSelector((state) => state.user.isFromCsvUpload);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");
  const [userData, setUserData] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [shouldResetCalcExcel, setShouldResetCalcExcel] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);
  const selectedCountryData = useSelector(
    (state) => state.country.selectedCountryData
  );

  const appType = process.env.REACT_APP_TYPE || "";

  const getStoredToggleState = () => {
    try {
      const stored = sessionStorage.getItem("isExcelMode");
      return stored === "true";
    } catch (error) {
      console.warn("세션스토리지 읽기 실패:", error);
      return false;
    }
  };

  const [isExcelMode, setIsExcelMode] = useState(getStoredToggleState);

  const saveToggleStateToStorage = (isExcel) => {
    try {
      sessionStorage.setItem("isExcelMode", isExcel.toString());
    } catch (error) {
      console.warn("세션스토리지 저장 실패:", error);
    }
  };

  const resetCalcExcelStorage = () => {
    sessionStorage.removeItem("calcExcel_userData");
    sessionStorage.removeItem("calcExcel_fileName");
    sessionStorage.removeItem("calcExcel_status");
    sessionStorage.removeItem("indemnity_csvData");
  };

  const findCountryCode = (countryInput) => {
    if (!countryInput || !countryInput.trim()) return null;

    const cleanInput = countryInput.replace(/[\r\n]/g, "").trim();

    let countryInfo = CityInfoData.find(
      (item) => item.korNatlNm.trim() === cleanInput
    );

    if (countryInfo) {
      return countryInfo.cityNatlCd;
    }

    const cityMatch = CityInfoData.find(
      (item) =>
        item.korCityNm === cleanInput ||
        (item.korCityNm && item.korCityNm.includes(cleanInput))
    );

    if (cityMatch) {
      return cityMatch.cityNatlCd;
    }

    countryInfo = CityInfoData.find(
      (item) =>
        item.korNatlNm.includes(cleanInput) ||
        cleanInput.includes(item.korNatlNm)
    );

    return countryInfo ? countryInfo.cityNatlCd : null;
  };

  const findCountryData = (countryInput) => {
    if (!countryInput || !countryInput.trim()) return null;

    const cleanInput = countryInput.replace(/[\r\n]/g, "").trim();

    let countryInfo = CityInfoData.find(
      (item) => item.korNatlNm && item.korNatlNm.trim() === cleanInput
    );

    if (countryInfo) {
      return {
        cityNatlCd: countryInfo.cityNatlCd,
        korNatlNm: countryInfo.korNatlNm,
        korCityNm: countryInfo.korCityNm,
      };
    }

    const cityMatch = CityInfoData.find(
      (item) =>
        item.korCityNm &&
        (item.korCityNm.trim() === cleanInput ||
          item.korCityNm.includes(cleanInput))
    );

    if (cityMatch) {
      return {
        cityNatlCd: cityMatch.cityNatlCd,
        korNatlNm: cityMatch.korNatlNm,
        korCityNm: cityMatch.korCityNm,
      };
    }

    countryInfo = CityInfoData.find(
      (item) =>
        item.korNatlNm &&
        (item.korNatlNm.includes(cleanInput) ||
          cleanInput.includes(item.korNatlNm))
    );

    if (countryInfo) {
      return {
        cityNatlCd: countryInfo.cityNatlCd,
        korNatlNm: countryInfo.korNatlNm,
        korCityNm: countryInfo.korCityNm,
      };
    }

    return null;
  };

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
    dispatch(setSelectedCountryData(null));
  }, [dispatch]);

  const resetLocalData = useCallback(() => {
    setUserData(null);
    setErrorMessage("");
    setSelectedCountry("");
  }, []);

  const hasInputData = useCallback(() => {
    const hasDirectInput =
      startDate ||
      endDate ||
      gender ||
      dateOfBirth ||
      companions.length > 0 ||
      selectedCountry;

    const hasExcelData = userData !== null;

    return hasDirectInput || hasExcelData;
  }, [
    startDate,
    endDate,
    gender,
    dateOfBirth,
    companions,
    selectedCountry,
    userData,
  ]);

  useEffect(() => {
    const storedToggleState = getStoredToggleState();
    setIsExcelMode(storedToggleState);

    if (storedToggleState && !isFromCsvUpload) {
      dispatch(setIsFromCsvUpload(true));
    } else if (!storedToggleState && isFromCsvUpload) {
      dispatch(setIsFromCsvUpload(false));
    }

    if (
      selectedCountryData &&
      selectedCountryData.korNatlNm &&
      !selectedCountry
    ) {
      setSelectedCountry(selectedCountryData.korNatlNm);
    }

    if (!startDate && !endDate && !gender && !dateOfBirth) {
      resetLocalData();
    }
  }, []);

  const handleNext = async () => {
    setIsNavigating(true);

    try {
      saveToggleStateToStorage(isExcelMode);

      if (!isExcelMode) {
        const countryCode = findCountryCode(selectedCountry);
        if (countryCode) {
          dispatch(setSelectedCountryData({ cityNatlCd: countryCode }));
        }

        await new Promise((resolve) => setTimeout(resolve, 300));
        navigate("/trip");
      } else {
        if (userData && userData.indemnityData) {
          const { contractor, companions, indemnityData } = userData;

          if (contractor) {
            dispatch(setKoreanName(contractor.koreanName));
            dispatch(setEnglishName(contractor.englishName));
            dispatch(setEmail(contractor.email));
            dispatch(setPhoneNumber(formatPhoneNumber(contractor.phoneNumber)));
            dispatch(setGender(contractor.gender === "남" ? "1" : "2"));

            if (contractor.birthDate && contractor.birthDate.length === 8) {
              dispatch(setDateOfBirth(contractor.birthDate));
            }

            if (companions.length > 0) {
              const companionData = companions.map((companion) => ({
                koreanName: companion.koreanName,
                englishName: companion.englishName,
                email: companion.email,
                phoneNumber: formatPhoneNumber(companion.phoneNumber),
                gender: companion.gender === "남" ? "1" : "2",
                dateOfBirth: companion.birthDate,
              }));
              dispatch(setCompanions(companionData));
            } else {
              dispatch(setCompanions([]));
            }

            dispatch(setIsFromCsvUpload(true));

            if (selectedCountry) {
              const countryData = findCountryData(selectedCountry);
              if (countryData) {
                dispatch(setSelectedCountryData(countryData));

                const updatedIndemnityData = {
                  ...indemnityData,
                  natlCd: countryData.cityNatlCd,
                  insBgnDt: startDate,
                  insEdDt: endDate,
                  hasDeparted: false,
                };

                sessionStorage.setItem(
                  "indemnity_csvData",
                  JSON.stringify(updatedIndemnityData)
                );
              }
            }
          }
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

  const isExcelDataValid = () => {
    if (!userData || !userData.contractor) return false;

    const contractor = userData.contractor;

    const contractorValid =
      contractor.koreanName && contractor.birthDate && contractor.gender;

    const englishNameValid =
      appType === "DOMESTIC" ||
      (contractor.englishName && contractor.englishName.trim() !== "");

    const companionsValid =
      userData.companions.length === 0 ||
      userData.companions.every(
        (companion) =>
          companion.koreanName &&
          companion.birthDate &&
          companion.gender &&
          (appType === "DOMESTIC" ||
            (companion.englishName && companion.englishName.trim() !== ""))
      );

    return contractorValid && englishNameValid && companionsValid;
  };

  const isButtonDisabled = () => {
    if (!startDate || !endDate || isNavigating) return true;

    if (!isExcelMode) {
      return (
        !gender ||
        !dateOfBirth ||
        !companionsInfoValid ||
        !isDateOfBirthValid ||
        errorMessage
      );
    } else {
      return !isExcelDataValid();
    }
  };

  const handleToggle = () => {
    if (hasInputData()) {
      const confirmed = window.confirm("방법 변경시 기존데이터는 삭제됩니다");
      if (!confirmed) {
        return;
      }
    }

    const newExcelMode = !isExcelMode;

    resetReduxData();
    resetLocalData();
    resetCalcExcelStorage();
    setIsExcelMode(newExcelMode);
    saveToggleStateToStorage(newExcelMode);
    setShouldResetCalcExcel(true);

    if (newExcelMode) {
      dispatch(setIsFromCsvUpload(true));
    } else {
      dispatch(setIsFromCsvUpload(false));
    }
  };

  const renderContent = () => {
    if (isExcelMode) {
      return (
        <CalcExcel
          faRetrustData={faRetrustData}
          onDataChange={setUserData}
          selectedCountry={selectedCountry}
          setSelectedCountry={setSelectedCountry}
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
                  className={`${styles.toggleButton} ${
                    isExcelMode ? styles.activeToggle : ""
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
