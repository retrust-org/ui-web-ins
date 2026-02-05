import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "../../../css/trip/indemnity.module.css";
import { selectData, setPriceData, setTotalPrice } from "../../../redux/store";
import ConfirmModal from "../../../components/modals/ConfirmModal";
import ErrorModal from "../../../components/modals/ErrorModal";
import Loading from "../../../components/loadings/Loading";
import Button from "../../../components/buttons/Button";
import { PLAN_DETAILS, PLAN_TYPES } from "../../../data/ConfirmPlanData";
import { formatPriceWithComma } from "../../../utils/formatPrice";

const RegularPlans = ({
  priceData,
  selectedData,
  handleItemClick,
  state,
  setState,
  showLite,
}) => (
  <div className={styles.plansContainer}>
    <div className={styles.regularPlansWrapper}>
      {Object.entries(PLAN_TYPES)
        .filter(
          ([key]) =>
            key !== "DEPARTED" &&
            (showLite || key !== "LITE") &&
            key !== "ACTIVITY"
        )
        .map(([key, name]) => (
          <div
            key={key}
            className={`${styles.wrap} ${
              selectedData?.name === name ? styles.selected : ""
            }`}
            onClick={() =>
              handleItemClick({ name, price: priceData?.[key]?.ttPrem })
            }
          >
            <div className={styles.ContentsFlexRow}>
              <div className={styles.ContentsImgWrap}>
                <img
                  src={
                    name === PLAN_TYPES.RECOMMEND
                      ? "/images/Rec_icon.png"
                      : name === PLAN_TYPES.PREMIUM
                      ? "/images/Lux_icon.png"
                      : name === PLAN_TYPES.BASIC
                      ? "/images/Benefit_icon.png"
                      : "/images/Ultra_icon.png"
                  }
                  alt={`${name} icon`}
                  className={styles.ContentsImg}
                />
              </div>
              <div className={styles.platformInfoWrap}>
                <span className={styles.platformName}>{name}</span>
                <div className={styles.platformPrice}>
                  {name === PLAN_TYPES.RECOMMEND && !state.priceActivated
                    ? "???"
                    : `${formatPriceWithComma(priceData?.[key]?.ttPrem)}원`}
                </div>
              </div>
            </div>
            <div className={styles.platformDetailWrap}>
              {PLAN_DETAILS[name].description.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
            {PLAN_DETAILS[name].showRecommendButton && (
              <div
                className={styles.recommandModalBtn}
                onClick={(e) => {
                  e.stopPropagation();
                  setState((prev) => ({ ...prev, showConfirmModal: true }));
                }}
              >
                <p className={styles.recommandModaTitle}>
                  클릭 한번으로 최적화된 플랜을 받아보세요
                </p>
              </div>
            )}
          </div>
        ))}
    </div>
  </div>
);

const Indemnity = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showLite, setShowLite] = useState(false);

  useEffect(() => {
    const savedState = sessionStorage.getItem("showLite") === "true";
    if (savedState) {
      setShowLite(true);
    }
  }, []);

  // Redux에서 기본 데이터 가져오기
  const {
    selectedData,
    startDate,
    endDate,
    gender,
    dateOfBirth,
    companions,
    recommendedCountry,
    selectedCountryData,
    priceData,
    isFromCsvUpload,
  } = useSelector((state) => ({
    selectedData: state.plan.selectedData,
    startDate: state.calendar.selectedStartDate,
    endDate: state.calendar.selectedEndDate,
    gender: state.user.gender,
    dateOfBirth: state.user.dateOfBirth,
    companions: state.companions,
    recommendedCountry: state.country.recommendedCountryData,
    selectedCountryData: state.country.selectedCountryData,
    priceData: state.priceData.priceData,
    isFromCsvUpload: state.pdf.isFromCsvUpload,
  }));

  const [state, setState] = useState(() => ({
    showConfirmModal: false,
    isLoading: false,
    priceActivated: sessionStorage.getItem("priceActivated") === "true",
    errorMessage: "",
  }));

  // 세션스토리지에서 엑셀 업로드 데이터 가져오기
  const getExcelDataFromStorage = useCallback(() => {
    try {
      const storedData = sessionStorage.getItem("calcExcel_userData");
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        console.log("Excel data from storage:", parsedData);
        return parsedData;
      }
    } catch (error) {
      console.warn("Excel data parsing error:", error);
    }
    return null;
  }, []);

  // 라이트 플랜 표시 시 스크롤 조정
  useEffect(() => {
    if (showLite) {
      window.scrollTo({
        top: document.documentElement.scrollHeight + window.innerHeight * 0.2,
        behavior: "smooth",
      });
    }
  }, [showLite]);

  const handleShowLite = useCallback(() => {
    setShowLite(true);
    sessionStorage.setItem("showLite", "true");

    if (priceData?.LITE) {
      dispatch(
        selectData({
          name: PLAN_TYPES.LITE,
          price: priceData.LITE.ttPrem,
        })
      );
      dispatch(setTotalPrice(priceData.LITE.ttPrem));
    }
  }, [dispatch, priceData]);

  // 성별 코드 정규화 함수
  const normalizeGenderCode = (gender) => {
    if (!gender) return "";
    const genderStr = String(gender).trim();
    if (genderStr === "남" || genderStr === "M" || genderStr === "1")
      return "1";
    if (genderStr === "여" || genderStr === "F" || genderStr === "2")
      return "2";
    return genderStr;
  };

  // 생년월일 정규화 함수
  const normalizeBirthDate = (birthDate) => {
    if (!birthDate) return "";
    const dateStr = String(birthDate).replace(/[^0-9]/g, "");
    return dateStr.length === 8 ? dateStr : "";
  };

  // 요청 데이터 생성 함수
  const createRequestData = useCallback(() => {
    const excelData = getExcelDataFromStorage();

    console.log("Creating request data with:", {
      isFromCsvUpload,
      excelData,
      startDate,
      endDate,
      selectedCountryData,
      recommendedCountry,
    });

    // 공통 정보
    const natlCd =
      selectedCountryData?.cityNatlCd || recommendedCountry?.cityNatlCd;

    if (!startDate || !endDate || !natlCd) {
      console.warn("Missing required basic data:", {
        startDate,
        endDate,
        natlCd,
      });
      return null;
    }

    let requestData;

    if (isFromCsvUpload && excelData) {
      // 엑셀 업로드 모드
      console.log("Using Excel data mode");

      const { contractor, companions: excelCompanions } = excelData;

      if (!contractor) {
        console.warn("No contractor data in excel");
        return null;
      }

      const totalPersonnel = 1 + (excelCompanions ? excelCompanions.length : 0);

      requestData = {
        hasDeparted: false,
        insBgnDt: startDate,
        insEdDt: endDate,
        natlCd: natlCd,
        inspeCnt: totalPersonnel.toString(),
        inspeInfos: [
          {
            inspeNm: "계약자",
            inspeBdt: normalizeBirthDate(contractor.birthDate),
            gndrCd: normalizeGenderCode(contractor.gender),
          },
        ],
      };

      // 동반자 정보 추가
      if (excelCompanions && excelCompanions.length > 0) {
        excelCompanions.forEach((companion, index) => {
          requestData.inspeInfos.push({
            inspeNm: `동반${index + 1}`,
            inspeBdt: normalizeBirthDate(companion.birthDate),
            gndrCd: normalizeGenderCode(companion.gender),
          });
        });
      }
    } else {
      // 직접 입력 모드
      console.log("Using manual input mode");

      if (!gender || !dateOfBirth) {
        console.warn("Missing contractor info for manual input:", {
          gender,
          dateOfBirth,
        });
        return null;
      }

      const totalPersonnel = 1 + (companions ? companions.length : 0);

      requestData = {
        hasDeparted: false,
        insBgnDt: startDate,
        insEdDt: endDate,
        natlCd: natlCd,
        inspeCnt: totalPersonnel.toString(),
        inspeInfos: [
          {
            inspeNm: "계약자",
            inspeBdt: normalizeBirthDate(dateOfBirth),
            gndrCd: normalizeGenderCode(gender),
          },
        ],
      };

      // 동반자 정보 추가
      if (companions && companions.length > 0) {
        companions.forEach((companion, index) => {
          if (!companion.gender || !companion.dateOfBirth) {
            console.warn(`Invalid companion ${index + 1}:`, companion);
            return;
          }

          requestData.inspeInfos.push({
            inspeNm: `동반${index + 1}`,
            inspeBdt: normalizeBirthDate(companion.dateOfBirth),
            gndrCd: normalizeGenderCode(companion.gender),
          });
        });
      }
    }

    // 데이터 유효성 검증
    const invalidInfos = requestData.inspeInfos.filter(
      (info) => !info.inspeBdt || !info.gndrCd || info.inspeBdt.length !== 8
    );

    if (invalidInfos.length > 0) {
      console.warn("Invalid inspeInfos found:", invalidInfos);
      return null;
    }

    console.log("Generated request data:", requestData);
    return requestData;
  }, [
    isFromCsvUpload,
    getExcelDataFromStorage,
    startDate,
    endDate,
    selectedCountryData,
    recommendedCountry,
    gender,
    dateOfBirth,
    companions,
  ]);

  const handleItemClick = useCallback(
    (platform) => {
      dispatch(selectData(platform));
      dispatch(setTotalPrice(platform.price));

      if (platform.name === PLAN_TYPES.RECOMMEND) {
        setState((prev) => ({ ...prev, showConfirmModal: true }));
      }
    },
    [dispatch]
  );

  const handleConfirm = useCallback(() => {
    if (!state.priceActivated) {
      setState((prev) => ({
        ...prev,
        errorMessage: "추천플랜 확인 후 이용해주세요.",
      }));
      return;
    }
    if (!selectedData) {
      setState((prev) => ({ ...prev, errorMessage: "플랜을 선택해주세요." }));
      return;
    }

    if (!state.priceActivated && selectedData.name === PLAN_TYPES.RECOMMEND) {
      setState((prev) => ({
        ...prev,
        errorMessage: "추천 플랜 가격을 활성화 후 이용해주세요.",
      }));
      return;
    }
    navigate("/confirm");
  }, [selectedData, state.priceActivated, navigate]);

  useEffect(() => {
    sessionStorage.setItem("indemnityState", JSON.stringify(state));
  }, [state]);

  // 가격 데이터 fetch
  useEffect(() => {
    const fetchData = async () => {
      const requestData = createRequestData();
      if (!requestData) {
        console.warn("Cannot create request data, skipping fetch");
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        console.log("Sending request:", requestData);

        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/trip-api/v2/trip/price`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestData),
          }
        );

        if (!response.ok) {
          throw new Error(`알 수 없는 오류입니다.: ${response.status}`);
        }

        const result = await response.json();
        console.log("API Response:", result);

        if (result.errCd === "20402") {
          setState((prev) => ({
            ...prev,
            errorMessage: result.errMsg,
          }));
        } else {
          dispatch(setPriceData(result));
        }
      } catch (error) {
        console.error("API Error:", error);
        setState((prev) => ({
          ...prev,
          errorMessage: "데이터를 불러오는 중 오류가 발생했습니다.",
        }));
      } finally {
        setState((prev) => ({ ...prev, isLoading: false }));
      }
    };

    fetchData();
  }, [createRequestData, dispatch]);

  if (state.isLoading) return <Loading />;

  return (
    <div className={styles.indemnityContents}>
      <div className={styles.indemnityWrap}>
        <div className={styles.title}>
          <div className={styles.imageWrap}>
            <img
              src="/images/meritzLogo.png"
              alt="logo"
              className={styles.ContentsImg}
            />
          </div>
          <p>
            인슈어트러스트는
            <br /> 메리츠화재와 함께해요
          </p>
        </div>
        <RegularPlans
          priceData={priceData}
          selectedData={selectedData}
          handleItemClick={handleItemClick}
          state={state}
          setState={setState}
          showLite={showLite}
        />
        <Button
          onClick={handleConfirm}
          disabled={!selectedData}
          buttonText="확인하기"
          showLiteButton={true}
          handleShowLite={handleShowLite}
        />
        <ConfirmModal
          isOpen={state.showConfirmModal}
          onClose={() => {
            setState((prev) => ({
              ...prev,
              showConfirmModal: false,
              priceActivated: true,
            }));
            sessionStorage.setItem("priceActivated", "true");
          }}
        />
        {state.errorMessage && (
          <ErrorModal
            message={state.errorMessage}
            onClose={() => setState((prev) => ({ ...prev, errorMessage: "" }))}
          />
        )}
      </div>
    </div>
  );
};

export default Indemnity;
