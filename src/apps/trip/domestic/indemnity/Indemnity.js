import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "../../../../css/trip/indemnity.module.css";
import {
  selectData,
  setPriceData,
  setTotalPrice,
} from "../../../../redux/store";
import ErrorModal from "../../../../components/modals/ErrorModal";
import Loading from "../../../../components/loadings/Loading";
import Button from "../../../../components/buttons/Button";
import { PLAN_DETAILS, PLAN_TYPES } from "../../../../data/DomesticPlanData";
import { formatPriceWithComma } from "../../../../utils/formatPrice";

const RegularPlans = ({
  priceData,
  selectedData,
  handleItemClick,
  showLite,
}) => {
  // 가입 불가 여부 확인 함수
  const isNotAvailable = (planData) => {
    if (!planData) return true;
    return planData.ttPrem === 0 || planData.ttPrem === "0" || !planData.ttPrem;
  };

  // 가격 표시 함수
  const getPriceDisplay = (planData) => {
    if (isNotAvailable(planData)) {
      return "가입불가";
    }
    return `${formatPriceWithComma(planData.ttPrem)}원`;
  };

  return (
    <div className={styles.plansContainer}>
      <div className={styles.regularPlansWrapper}>
        {Object.entries(PLAN_TYPES)
          .filter(([key]) => {
            if (key === "PREMIUM" || key === "BASIC" || key === "LITE")
              return true;
            if (key === "ACTIVITY") return showLite;
            return false;
          })
          .map(([key, name]) => {
            const planData = priceData?.[key];
            const notAvailable = isNotAvailable(planData);

            return (
              <div
                key={key}
                className={`${styles.wrap} ${
                  selectedData?.name === name ? styles.selected : ""
                }`}
                onClick={() => {
                  if (!notAvailable) {
                    handleItemClick({ name, price: planData?.ttPrem });
                  }
                }}
                style={{
                  cursor: notAvailable ? "not-allowed" : "pointer",
                  opacity: notAvailable ? 0.6 : 1,
                }}
              >
                <div className={styles.ContentsFlexRow}>
                  <div className={styles.ContentsImgWrap}>
                    <img
                      src={
                        name === PLAN_TYPES.PREMIUM
                          ? "/images/Lux_icon.png"
                          : name === PLAN_TYPES.BASIC
                          ? "/images/Benefit_icon.png"
                          : name === PLAN_TYPES.ACTIVITY
                          ? "/images/Activity_icon.png"
                          : "/images/Ultra_icon.png"
                      }
                      alt={`${name} icon`}
                      className={styles.ContentsImg}
                    />
                  </div>
                  <div className={styles.platformInfoWrap}>
                    <span className={styles.platformName}>{name}</span>
                    <div className={styles.platformPrice}>
                      {getPriceDisplay(planData)}
                      {notAvailable && (
                        <p className={styles.warnMessage}>
                          만 69세까지만 가입이 가능합니다.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.platformDetailWrap}>
                  {PLAN_DETAILS[name]?.description?.map((text, i) => {
                    if (
                      text.includes("<strong>") &&
                      text.includes("</strong>")
                    ) {
                      const parts = text.split(/<strong>|<\/strong>/);
                      return (
                        <p key={i}>
                          {parts.map((part, j) =>
                            j % 2 === 0 ? part : <strong key={j}>{part}</strong>
                          )}
                        </p>
                      );
                    }
                    return <p key={i}>{text}</p>;
                  })}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};

const Indemnity = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const [showLite, setShowLite] = useState(() => {
    return sessionStorage.getItem("showLite") === "true";
  });

  // Redux에서 기본 데이터 가져오기
  const {
    selectedData,
    startDate,
    endDate,
    gender,
    dateOfBirth,
    companions,
    priceData,
  } = useSelector((state) => ({
    selectedData: state.plan.selectedData,
    startDate: state.calendar.selectedStartDate,
    endDate: state.calendar.selectedEndDate,
    gender: state.user.gender,
    dateOfBirth: state.user.dateOfBirth,
    companions: state.companions,
    priceData: state.priceData.priceData,
  }));

  const [state, setState] = useState({
    isLoading: false,
    errorMessage: "",
  });

  // 세션스토리지에서 엑셀 업로드 데이터 가져오기
  const getExcelDataFromStorage = useCallback(() => {
    try {
      const storedData = sessionStorage.getItem("calcExcel_userData");
      if (storedData) {
        return JSON.parse(storedData);
      }
    } catch (error) {
      console.warn("Excel data parsing error:", error);
    }
    return null;
  }, []);

  // 특별 플랜 표시 시 스크롤 조정
  useEffect(() => {
    if (showLite) {
      window.scrollTo({
        top: document.documentElement.scrollHeight + window.innerHeight * 0.2,
        behavior: "smooth",
      });
    }
  }, [showLite]);

  // 액티비티 플랜 선택 함수
  const selectActivityPlan = useCallback(() => {
    if (
      priceData?.ACTIVITY &&
      priceData.ACTIVITY.ttPrem !== "0" &&
      priceData.ACTIVITY.ttPrem !== 0
    ) {
      dispatch(
        selectData({
          name: PLAN_TYPES.ACTIVITY,
          price: priceData.ACTIVITY.ttPrem,
        })
      );
      dispatch(setTotalPrice(priceData.ACTIVITY.ttPrem));
    }
  }, [dispatch, priceData]);

  const handleShowLite = useCallback(() => {
    setShowLite(true);
    sessionStorage.setItem("showLite", "true");
    selectActivityPlan();
  }, [selectActivityPlan]);

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

  // 총 인원수 계산
  const totalPersonnel = useMemo(() => {
    return 1 + (companions?.length || 0);
  }, [companions]);

  // 요청 데이터 생성 함수
  const createRequestData = useCallback(() => {
    const excelData = getExcelDataFromStorage();
    const isExcelMode =
      sessionStorage.getItem("isDomesticExcelMode") === "true";

    if (!startDate || !endDate || !totalPersonnel) {
      console.warn("Missing required basic data");
      return null;
    }

    let requestData;

    if (isExcelMode && excelData) {
      const { contractor, companions: excelCompanions } = excelData;

      if (!contractor) {
        console.warn("No contractor data in domestic excel");
        return null;
      }

      const totalPersonnelFromExcel =
        1 + (excelCompanions ? excelCompanions.length : 0);

      requestData = {
        insBgnDt: startDate,
        insEdDt: endDate,
        productCd: "15920",
        natlCd: "KR00",
        inspeCnt: totalPersonnelFromExcel.toString(),
        inspeInfos: [
          {
            inspeNm: "계약자",
            inspeBdt: normalizeBirthDate(contractor.birthDate),
            gndrCd: normalizeGenderCode(contractor.gender),
          },
        ],
      };

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
      if (!gender || !dateOfBirth) {
        console.warn("Missing contractor info for domestic manual input");
        return null;
      }

      requestData = {
        insBgnDt: startDate,
        insEdDt: endDate,
        productCd: "15920",
        natlCd: "KR00",
        inspeCnt: totalPersonnel.toString(),
        inspeInfos: [
          {
            inspeNm: "계약자",
            inspeBdt: normalizeBirthDate(dateOfBirth),
            gndrCd: normalizeGenderCode(gender),
          },
        ],
      };

      if (companions && companions.length > 0) {
        companions.forEach((companion, index) => {
          if (companion.gender && companion.dateOfBirth) {
            requestData.inspeInfos.push({
              inspeNm: `동반${index + 1}`,
              inspeBdt: normalizeBirthDate(companion.dateOfBirth),
              gndrCd: normalizeGenderCode(companion.gender),
            });
          }
        });
      }
    }

    // 데이터 유효성 검증
    const invalidInfos = requestData.inspeInfos.filter(
      (info) => !info.inspeBdt || !info.gndrCd || info.inspeBdt.length !== 8
    );

    if (invalidInfos.length > 0) {
      console.warn("Invalid domestic inspeInfos found:", invalidInfos);
      return null;
    }

    return requestData;
  }, [
    getExcelDataFromStorage,
    startDate,
    endDate,
    totalPersonnel,
    gender,
    dateOfBirth,
    companions,
  ]);

  const handleItemClick = useCallback(
    (platform) => {
      dispatch(selectData(platform));
      dispatch(setTotalPrice(platform.price));
    },
    [dispatch]
  );

  const handleConfirm = useCallback(() => {
    if (!selectedData) {
      setState((prev) => ({ ...prev, errorMessage: "플랜을 선택해주세요." }));
      return;
    }

    // 선택된 플랜이 가입불가인지 확인
    const selectedPlanKey = Object.keys(PLAN_TYPES).find(
      (key) => PLAN_TYPES[key] === selectedData.name
    );
    const selectedPlanData = priceData?.[selectedPlanKey];

    if (
      !selectedPlanData ||
      selectedPlanData.ttPrem === "0" ||
      selectedPlanData.ttPrem === 0
    ) {
      setState((prev) => ({
        ...prev,
        errorMessage: "만 69세까지만 가입이 가능합니다.",
      }));
      return;
    }

    navigate("/confirm");
  }, [selectedData, priceData, navigate]);

  // 데이터가 로드된 후 자동으로 LITE 플랜 선택 (가입 가능한 경우에만)
  useEffect(() => {
    if (!selectedData && priceData?.LITE) {
      if (priceData.LITE.ttPrem !== "0" && priceData.LITE.ttPrem !== 0) {
        dispatch(
          selectData({
            name: PLAN_TYPES.LITE,
            price: priceData.LITE.ttPrem,
          })
        );
        dispatch(setTotalPrice(priceData.LITE.ttPrem));
      }
    }
  }, [priceData, dispatch, selectedData]);

  // 가격 데이터 fetch
  useEffect(() => {
    const fetchData = async () => {
      const requestData = createRequestData();
      if (!requestData) {
        console.warn("Cannot create domestic request data, skipping fetch");
        return;
      }

      setState((prev) => ({ ...prev, isLoading: true }));

      try {
        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/trip-api/api/v3/trip/calculate`,
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
        dispatch(setPriceData(result));
      } catch (error) {
        console.error("Domestic API Error:", error);
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
          showLite={showLite}
        />
        <Button
          onClick={handleConfirm}
          disabled={!selectedData}
          buttonText="확인하기"
          showLiteButton={true}
          handleShowLite={handleShowLite}
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
