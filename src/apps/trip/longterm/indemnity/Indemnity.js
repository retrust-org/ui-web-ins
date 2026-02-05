import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useSearchParams, useNavigate } from "react-router-dom";
import styles from "../../../../css/trip/indemnity.module.css";
import {
  selectData,
  setPriceData,
  setTotalPrice,
} from "../../../../redux/store";
import ErrorModal from "../../../../components/modals/ErrorModal";
import Loading from "../../../../components/loadings/Loading";
import Button from "../../../../components/buttons/Button";
import { PLAN_DETAILS, PLAN_TYPES } from "../../../../data/ConfirmPlanData";
import { formatPriceWithComma } from "../../../../utils/formatPrice";

const RegularPlans = ({ priceData, selectedData, handleItemClick }) => (
  <div className={styles.plansContainer}>
    <div className={styles.regularPlansWrapper}>
      {Object.entries(PLAN_TYPES)
        .filter(
          ([key]) =>
            key !== "DEPARTED" && key !== "RECOMMEND" && key !== "ACTIVITY" // ACTIVITY 플랜 제외 추가
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
                    name === PLAN_TYPES.PREMIUM
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
                  {`${formatPriceWithComma(priceData?.[key]?.ttPrem)}원`}
                </div>
              </div>
            </div>
            <div className={styles.platformDetailWrap}>
              {PLAN_DETAILS[name].description.map((text, i) => (
                <p key={i}>{text}</p>
              ))}
            </div>
          </div>
        ))}
    </div>
  </div>
);

const Indemnity = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Longterm 환경에서는 항상 초실속 플랜 표시
  // showLite 상태는 더 이상 필요하지 않음

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
    purpose,
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
    purpose: state.purpose.purpose,
  }));

  const [state, setState] = useState(() => ({
    isLoading: false,
    errorMessage: "",
  }));

  // 초실속 플랜 선택을 위한 함수
  const selectLitePlan = useCallback(() => {
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

  const csvData = useMemo(() => {
    try {
      const dataParam = searchParams.get("data");
      return dataParam ? JSON.parse(decodeURIComponent(dataParam)) : null;
    } catch (error) {
      console.error("CSV 데이터 파싱 오류:", error);
      return null;
    }
  }, [searchParams]);

  const { totalPersonnel, natlCds } = useMemo(
    () => ({
      totalPersonnel: csvData ? csvData.inspeCnt : 1 + companions.length,
      natlCds:
        csvData?.natlCd ||
        selectedCountryData?.cityNatlCd ||
        recommendedCountry?.cityNatlCd,
    }),
    [csvData, companions, selectedCountryData, recommendedCountry]
  );

  const createRequestData = useCallback(() => {
    if (!csvData && (!startDate || !endDate || !natlCds || !totalPersonnel)) {
      return null;
    }

    return csvData
      ? {
          ...csvData,
        }
      : {
          insBgnDt: startDate,
          insEdDt: endDate,
          natlCd: natlCds,
          inspeCnt: totalPersonnel.toString(),
          // product_cd: "15670",
          purposeCd: purpose,
          inspeInfos: [
            { inspeNm: "계약자", inspeBdt: dateOfBirth, gndrCd: gender },
            ...companions.map((calc, i) => ({
              inspeNm: `동반${i + 1}`,
              inspeBdt: calc.dateOfBirth,
              gndrCd: calc.gender,
            })),
          ],
        };
  }, [
    csvData,
    startDate,
    endDate,
    natlCds,
    totalPersonnel,
    dateOfBirth,
    gender,
    companions,
    purpose,
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
    navigate("/confirm");
  }, [selectedData, navigate]);

  useEffect(() => {
    sessionStorage.setItem("indemnityState", JSON.stringify(state));
  }, [state]);

  // 데이터가 로드된 후 자동으로 초실속 플랜 선택
  useEffect(() => {
    if (priceData?.LITE && !selectedData) {
      selectLitePlan();
    }
  }, [priceData, selectLitePlan, selectedData]);

  useEffect(() => {
    const fetchData = async () => {
      const requestData = createRequestData();
      if (!requestData) return;

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
        />
        <Button
          onClick={handleConfirm}
          disabled={!selectedData}
          buttonText="확인하기"
          showLiteButton={false} // 초실속 플랜 버튼을 표시하지 않음
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
