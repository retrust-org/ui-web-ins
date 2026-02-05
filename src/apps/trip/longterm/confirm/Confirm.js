import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styles from "../../../../css/trip/confirm.module.css";
import Button from "../../../../components/buttons/Button";
import {
  setTotalPrice,
  setSelectedPlanName,
  selectData,
} from "../../../../redux/store";
import { getGenderString } from "../insert/Gender";
import ModifyModal from "../../../../components/modals/Modifymodal";
import { downloadPDF } from "../../../../utils/pdfUtils";
import {
  calculateInsuranceAge,
  calculateManAge,
  formatKoreanDate,
  getTodayYYYYMMDD,
} from "../../../../utils/birthDate";
import { formatPrice, formatKoreanPrice } from "../../../../utils/formatPrice";
import {
  PLAN_TYPES,
  PLAN_KEYS,
  PLAN_LIST,
} from "../../../../data/ConfirmPlanData";
import downLoad from "../../../../assets/downLoad.svg";
import ConfirmPDF from "../../components/ConfirmPDF";

function Confirm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const [userAge, setUserAge] = useState("");
  const [userInsuranceAge, setUserInsuranceAge] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const appType = process.env.REACT_APP_TYPE || "";

  // Redux selectors
  const selectedStartDate = useSelector(
    (state) => state.calendar.selectedStartDate
  );
  const selectedEndDate = useSelector(
    (state) => state.calendar.selectedEndDate
  );
  const userGender = useSelector((state) => state.user.gender);
  const userDateOfBirth = useSelector((state) => state.user.dateOfBirth);
  const priceData = useSelector((state) => state.priceData.priceData);
  const totalPrice = useSelector((state) => state.totalPrice.totalPrice);
  const selectedData = useSelector((state) => state.plan.selectedData);
  const companions = useSelector((state) => state.companions);
  const pdfBlobs = useSelector((state) => state.pdf.pdfBlobs);
  const isFromCsvUpload = useSelector((state) => state.pdf.isFromCsvUpload);

  // 필터링된 플랜 목록 - '추천 플랜' 제외 및 앱 타입에 따른 필터링
  const filteredPlanList = useMemo(() => {
    return PLAN_LIST.filter(
      (plan) =>
        plan.dataKey !== "RECOMMEND" &&
        (appType === "DOMESTIC" || plan.dataKey !== "ACTIVITY")
    );
  }, [appType]);

  const [activePlan, setActivePlan] = useState(() => {
    // 이전 페이지에서 초실속 플랜이 자동으로 선택되므로, 초기값 설정
    if (selectedData) {
      const planType = PLAN_KEYS[selectedData.name];
      if (planType && priceData?.[planType]) {
        return planType;
      }
    }
    return "LITE"; // 기본값을 LITE로 설정
  });

  // ACTIVITY 플랜이 선택되어 있고, DOMESTIC 앱이 아닌 경우 기본 플랜으로 전환
  useEffect(() => {
    if (activePlan === "ACTIVITY" && appType !== "DOMESTIC") {
      setActivePlan("LITE");
      dispatch(setSelectedPlanName(PLAN_TYPES.LITE));
      dispatch(
        selectData({ name: PLAN_TYPES.LITE, price: priceData?.LITE?.ttPrem })
      );
    }
  }, [appType, dispatch, priceData, activePlan]);

  const currentPlanForPDF = activePlan;

  const handleDownloadClick = () => {
    if (pdfBlobs[currentPlanForPDF]) {
      downloadPDF(pdfBlobs[currentPlanForPDF], currentPlanForPDF);
    }
  };

  const csvData = useMemo(() => {
    try {
      const dataParam = searchParams.get("data");
      return dataParam ? JSON.parse(decodeURIComponent(dataParam)) : null;
    } catch (error) {
      console.error("CSV 데이터 파싱 오류:", error);
      return null;
    }
  }, [searchParams]);

  const userInfo = useMemo(() => {
    if (csvData) {
      const contractor = csvData.inspeInfos[0];
      return {
        gender: contractor.gndrCd,
        dateOfBirth: contractor.inspeBdt,
        startDate: csvData.insBgnDt,
        endDate: csvData.insEdDt,
        totalCount: parseInt(csvData.inspeCnt),
        companions: csvData.inspeInfos.slice(1),
      };
    }

    return {
      gender: userGender,
      dateOfBirth: userDateOfBirth,
      startDate: selectedStartDate,
      endDate: selectedEndDate,
      totalCount: companions?.length + 1,
      companions: companions || [],
    };
  }, [
    csvData,
    userGender,
    userDateOfBirth,
    selectedStartDate,
    selectedEndDate,
    companions,
  ]);

  // 선택된 데이터가 변경되면 활성 플랜 업데이트
  useEffect(() => {
    if (selectedData) {
      const planType = PLAN_KEYS[selectedData.name];
      if (planType && priceData?.[planType]) {
        setActivePlan(planType);
      }
    }
  }, [selectedData, priceData]);

  useEffect(() => {
    const checkButtonActive = () => {
      const hasRequiredData =
        userInfo.startDate &&
        userInfo.endDate &&
        userInfo.dateOfBirth &&
        priceData?.[activePlan]?.ttPrem;

      const isValidDates = () => {
        if (!userInfo.startDate || !userInfo.endDate) return false;
        const start = new Date(
          userInfo.startDate.substring(0, 4),
          parseInt(userInfo.startDate.substring(4, 6)) - 1,
          userInfo.startDate.substring(6, 8)
        );
        const end = new Date(
          userInfo.endDate.substring(0, 4),
          parseInt(userInfo.endDate.substring(4, 6)) - 1,
          userInfo.endDate.substring(6, 8)
        );
        return start <= end;
      };

      setIsButtonActive(hasRequiredData && isValidDates());
    };

    checkButtonActive();
  }, [userInfo, priceData, activePlan]);

  useEffect(() => {
    dispatch(setTotalPrice(priceData?.[activePlan]?.ttPrem));
    dispatch(setSelectedPlanName(PLAN_TYPES[activePlan] || PLAN_TYPES.LITE));
  }, [activePlan, priceData, dispatch]);

  // 나이 계산 로직 수정
  useEffect(() => {
    if (userInfo.dateOfBirth) {
      // 현재 날짜를 YYYYMMDD 형식으로 구하기
      const today = getTodayYYYYMMDD();

      // 부보시기(여행 시작일)를 기준으로 보험나이 계산 (여행 시작일이 없을 경우 현재 날짜 사용)
      const baseDate = userInfo.startDate || today;

      // 만 나이 계산
      const manAge = calculateManAge(userInfo.dateOfBirth, baseDate);
      setUserAge(manAge);

      // 보험나이 계산
      const insuranceAge = calculateInsuranceAge(
        userInfo.dateOfBirth,
        baseDate
      );
      setUserInsuranceAge(insuranceAge);
    }
  }, [userInfo.dateOfBirth, userInfo.startDate]);

  const quotations = useMemo(() => {
    if (!priceData) return [];
    return [
      {
        opapiGnrCoprCtrQuotCovInfCbcVo:
          priceData[activePlan]?.opapiGnrCoprCtrInspeInfCbcVo[0]
            ?.opapiGnrCoprCtrQuotCovInfCbcVo || [],
      },
    ];
  }, [priceData, activePlan]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return formatKoreanDate(dateString);
    } catch (error) {
      console.error("날짜 변환 오류:", error);
      return "-";
    }
  };

  const handlePlanButtonClick = (dataKey, planName) => {
    setActivePlan(dataKey);
    dispatch(setSelectedPlanName(`${planName}`));
    dispatch(selectData({ name: planName }));
  };

  const renderInsuredPersons = () => (
    <div className={styles.dataFlexbox}>
      <p>가입자</p>
      <div className="flex flex-col">
        <span>
          {getGenderString(userInfo.gender)} (만 {userAge}세 / 보험나이{" "}
          {userInsuranceAge}세)
          {companions.length > 0 ? ` 외 ${companions.length}명` : ""}
        </span>
      </div>
    </div>
  );

  const renderQuotations = () => (
    <div className={styles.dataListWrap}>
      {quotations.map((personData, personIndex) => (
        <div key={personIndex} className={styles.personQuotations}>
          {personData.opapiGnrCoprCtrQuotCovInfCbcVo.map((item, index) => (
            <div key={`${personIndex}-${index}`} className={styles.dataList}>
              <p className={styles.datalist_text}>특약</p>
              <div className={styles.priceDatas}>
                <p>{item.covNm}</p>
              </div>
              <div className={styles.imagePrice}>
                <p>{formatKoreanPrice(parseInt(item.insdAmt))}원</p>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );

  const nextButton = () => {
    if (isButtonActive) {
      navigate("/signup/member");
    }
  };

  return (
    <div className={styles.confirmContents}>
      <div className={styles.confirmWrap}>
        <div className={styles.headerSection}>
          <h3>
            선택하신 <span className={styles.highlight}>보장내용</span>과{" "}
            <span className={styles.highlight}>보험료</span>를<br />{" "}
            안내해드립니다.
          </h3>

          {isFromCsvUpload && pdfBlobs?.[currentPlanForPDF]?.size > 0 && (
            <div className={styles.pdfBtnWrap}>
              <button
                onClick={handleDownloadClick}
                className={styles.pdfDownloadButton}
              >
                <img src={downLoad} alt="downLoad" />
                <span>견적서 다운로드</span>
              </button>
            </div>
          )}
        </div>

        <section className={styles.section}>
          <div className={styles.sectionWrap}>
            <div className={styles.sectionWrap_title}>
              <div className={styles.ContentsImgWrap}>
                <img
                  src={
                    activePlan === "PREMIUM"
                      ? "/images/Lux_icon.png"
                      : activePlan === "BASIC"
                      ? "/images/Benefit_icon.png"
                      : activePlan === "ACTIVITY"
                      ? "/images/Activity_icon.png"
                      : "/images/Ultra_icon.png"
                  }
                  alt={`${PLAN_TYPES[activePlan]} 로고`}
                  className={styles.ContentsImg}
                />
              </div>
              <p>{PLAN_TYPES[activePlan]}</p>
            </div>
            <div className={styles.section_DataContents}>
              <div className={styles.dataContext}>
                <p>가입내용</p>
                <span
                  className={styles.modifyButton}
                  onClick={() => setIsModalOpen(true)}
                >
                  수정하기
                </span>
              </div>
              <div className={styles.section_DataContentsWrap}>
                <div className={styles.dataFlexbox}>
                  <p>출발 일정일</p>
                  <span>{formatDate(userInfo.startDate)}</span>
                </div>
                <div className={styles.dataFlexbox}>
                  <p>도착 일정일</p>
                  <span>{formatDate(userInfo.endDate)}</span>
                </div>
                {renderInsuredPersons()}
                <div className={styles.section_cost}>
                  <div className={styles.section_costWrap}>
                    <p>총 보험료</p>
                    <span>{formatPrice(parseInt(totalPrice || 0))}원</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <p className={styles.announce}>
          <span>*</span> 만 15세 미만 고객은 사망보장이 제외된 보장 내용으로
          가입됨을 안내드립니다.
        </p>

        <section className={styles.filterBtn}>
          <div className={styles.filterBtnWrap}>
            <ul>
              {filteredPlanList.map((plan, index) => (
                <li
                  key={index}
                  className={`cursor-pointer w-full mx-auto ${
                    plan.dataKey === activePlan ? styles.active : ""
                  }`}
                  onClick={() => handlePlanButtonClick(plan.dataKey, plan.name)}
                >
                  {plan.name.replace(" 플랜", "")}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <div className="w-full">{renderQuotations()}</div>
        <ConfirmPDF />
        <ModifyModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
        />
        <div className={styles.buttonWrap}>
          <div className={styles.buttonWrap_bg}></div>
          <div className={styles.buttonWrap_line}></div>
          <Button
            buttonText="보험 가입하기"
            onClick={nextButton}
            disabled={!isButtonActive}
          />
        </div>
      </div>
    </div>
  );
}

export default Confirm;
