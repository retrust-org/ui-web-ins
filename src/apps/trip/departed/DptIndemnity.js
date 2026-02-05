import React, { useCallback, useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import styles from "../../../css/trip/indemnity.module.css"; // 기존 CSS 파일 유지
import { selectData, setPriceData, setTotalPrice } from "../../../redux/store";
import ErrorModal from "../../../components/modals/ErrorModal";
import Loading from "../../../components/loadings/Loading";
import Button from "../../../components/buttons/Button";
import { PLAN_TYPES } from "../../../data/ConfirmPlanData";
import { formatPriceWithComma } from "../../../utils/formatPrice";
import IndemnityAgree from "../../../components/modals/IndemnityAgree";

const DepartedPlan = ({ priceData, onClickPlan, isSelected, isAgreed }) => (
  <div
    className={`${styles.wrap} ${styles.departed} ${isSelected && isAgreed ? styles.selected : ""
      }`}
    onClick={onClickPlan}
  >
    <div className={styles.ContentsFlexRow}>
      <div className={styles.ContentsImgWrap}>
        <img
          src="/images/airport.png"
          alt="logo"
          className={styles.ContentsImg}
        />
      </div>
      <div className={styles.platformInfoWrap}>
        <span className={styles.platformName}>{PLAN_TYPES.DEPARTED}</span>
        <div className={styles.platformPrice}>
          {formatPriceWithComma(priceData.DEPARTED.ttPrem)}원
        </div>
      </div>
    </div>
    <div className={styles.checkAnnounce}>
      <div className={styles.checkAnnounceWrap}>
        <p>가입 전 아래사항을 확인해주세요!</p>
      </div>
    </div>
    <ul className={styles.platformDetailWrap_depart}>
      <li>
        비행기 <span>출발시간 24시간</span> 이내라면, 가입 OK
      </li>
      <li>
        사망담보 3억원, 골절진단비(20만원), 상해/질병입원일당(4일이상) 3만원
      </li>
      <li>익스트림담보 1천만원 담보</li>
      <li className={styles.notice}>
        <p>*</p>
        <p>
          단, 휴대품손해, 여권재발급, 항공기수하물지연비용, 해외국내의료실비는
          담보되지 않음
        </p>
      </li>
    </ul>
  </div>
);

const DptIndemnity = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [showIndemnityAgree, setShowIndemnityAgree] = useState(false);
  const [isAgreed, setIsAgreed] = useState(false);

  const {
    selectedData,
    startDate,
    endDate,
    gender,
    dateOfBirth,
    companions,
    priceData,
    recommendedCountry,
    selectedCountryData,
  } = useSelector((state) => ({
    selectedData: state.plan.selectedData,
    startDate: state.calendar.selectedStartDate,
    endDate: state.calendar.selectedEndDate,
    gender: state.user.gender,
    dateOfBirth: state.user.dateOfBirth,
    companions: state.companions,
    priceData: state.priceData.priceData,
    recommendedCountry: state.country.recommendedCountryData,
    selectedCountryData: state.country.selectedCountryData,
  }));

  const [state, setState] = useState(() => ({
    isLoading: false,
    errorMessage: '',
  }));

  const natlCds = selectedCountryData?.cityNatlCd || recommendedCountry?.cityNatlCd;

  const createRequestData = useCallback(() => {
    const totalPersonnel = 1 + companions.length;

    return {
      hasDeparted: true,
      insBgnDt: startDate,
      insEdDt: endDate,
      natlCd: natlCds,
      inspeCnt: totalPersonnel.toString(),
      inspeInfos: [
        { inspeNm: "계약자", inspeBdt: dateOfBirth, gndrCd: gender },
        ...companions.map((calc, i) => ({
          inspeNm: `동반${i + 1}`,
          inspeBdt: calc.dateOfBirth,
          gndrCd: calc.gender,
        })),
      ],
    };
  }, [startDate, endDate, dateOfBirth, gender, companions, natlCds]);

  const handleDepartedPlanClick = useCallback(() => {
    setShowIndemnityAgree(true);
    if (isAgreed && priceData?.DEPARTED) {
      const departedPlan = {
        name: PLAN_TYPES.DEPARTED,
        price: priceData.DEPARTED.ttPrem,
      };
      dispatch(selectData(departedPlan));
    }
  }, [priceData?.DEPARTED, dispatch, isAgreed]);

  const handleConfirm = useCallback(() => {
    if (!selectedData) {
      setState((prev) => ({ ...prev, errorMessage: "플랜을 선택해주세요." }));
      return;
    }

    if (!isAgreed) {
      setState((prev) => ({
        ...prev,
        errorMessage: "이용약관에 동의해주세요.",
      }));
      return;
    }

    navigate("/confirm");
  }, [selectedData, navigate, isAgreed]);

  useEffect(() => {
    if (priceData?.DEPARTED && isAgreed) {
      const departedPlan = {
        name: PLAN_TYPES.DEPARTED,
        price: priceData.DEPARTED.ttPrem,
      };
      dispatch(selectData(departedPlan));
      dispatch(setTotalPrice(departedPlan.price));
      sessionStorage.setItem("selectedPlan", PLAN_TYPES.DEPARTED);
    }
  }, [priceData?.DEPARTED, dispatch, isAgreed]);

  useEffect(() => {
    sessionStorage.setItem("dptIndemnityState", JSON.stringify(state));
  }, [state]);

  useEffect(() => {
    const fetchData = async () => {
      const requestData = createRequestData();
      if (!requestData) return;

      setState((prev) => ({ ...prev, isLoading: true }));

      try {
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
        {priceData?.DEPARTED && (
          <DepartedPlan
            priceData={priceData}
            onClickPlan={handleDepartedPlanClick}
            isSelected={selectedData?.name === PLAN_TYPES.DEPARTED}
            isAgreed={isAgreed}
          />
        )}
        <Button
          onClick={handleConfirm}
          disabled={!selectedData || !isAgreed}
          buttonText="확인하기"
        />
        <IndemnityAgree
          isOpen={showIndemnityAgree}
          onClose={() => setShowIndemnityAgree(false)}
          onAgree={(agreed) => setIsAgreed(agreed)}
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

export default DptIndemnity;