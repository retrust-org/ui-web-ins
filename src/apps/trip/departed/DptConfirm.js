import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import styles from "../../../css/trip/confirm.module.css";
import Button from "../../../components/buttons/Button";
import { setTotalPrice, setSelectedPlanName } from "../../../redux/store";
import { getGenderString } from "./DptGender";
import ModifyModal from "../../../components/modals/Modifymodal";
import {
  calculateInsuranceAge,
  calculateManAge,
  formatKoreanDate,
  getTodayYYYYMMDD,
} from "../../../utils/birthDate";
import { formatPrice, formatKoreanPrice } from "../../../utils/formatPrice";
import { PLAN_TYPES } from "../../../data/ConfirmPlanData";
import ConfirmPDF from "../components/ConfirmPDF";

function DptConfirm() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [userAge, setUserAge] = useState("");
  const [userInsuranceAge, setUserInsuranceAge] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);

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
  const companions = useSelector((state) => state.companions);

  const userInfo = useMemo(() => {
    const departedData = priceData?.DEPARTED;
    if (departedData) {
      const inspeInfos = departedData.opapiGnrCoprCtrInspeInfCbcVo;
      return {
        gender: inspeInfos[0].gndrCd,
        dateOfBirth: userDateOfBirth,
        startDate: selectedStartDate,
        endDate: selectedEndDate,
        totalCount: inspeInfos.length,
        companions: inspeInfos.slice(1),
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
    priceData,
    userGender,
    userDateOfBirth,
    selectedStartDate,
    selectedEndDate,
    companions,
  ]);

  useEffect(() => {
    const checkButtonActive = () => {
      const hasRequiredData =
        userInfo.startDate &&
        userInfo.endDate &&
        userInfo.dateOfBirth &&
        priceData?.DEPARTED?.ttPrem;

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
  }, [userInfo, priceData]);

  useEffect(() => {
    dispatch(setTotalPrice(priceData?.DEPARTED?.ttPrem));
    dispatch(setSelectedPlanName(PLAN_TYPES.DEPARTED));
  }, [priceData, dispatch]);

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
    if (!priceData?.DEPARTED) return [];

    const contractorData = priceData.DEPARTED.opapiGnrCoprCtrInspeInfCbcVo[0];
    return [
      {
        opapiGnrCoprCtrQuotCovInfCbcVo:
          contractorData.opapiGnrCoprCtrQuotCovInfCbcVo,
      },
    ];
  }, [priceData]);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    try {
      return formatKoreanDate(dateString);
    } catch (error) {
      console.error("날짜 변환 오류:", error);
      return "-";
    }
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
              <p className={`${styles.datalist_text} ${styles.hasDeparted}`}>
                특약
              </p>
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
            <span className={styles.hasDeparteds}>출국 후</span> 보험 가입
            내용입니다
          </h3>
        </div>

        <section className={styles.on}>
          <div className={styles.sectionWrap}>
            <div className={styles.sectionWrap_title}>
              <div className={styles.ContentsImgWrap}>
                <img
                  src="/images/airport.png"
                  alt={`${PLAN_TYPES.DEPARTED} 로고`}
                  className={styles.ContentsImg}
                />
              </div>
              <p>{PLAN_TYPES.DEPARTED}</p>
            </div>
            <div className={styles.section_DataContents}>
              <div className={styles.dataContext}>
                <p>가입내용</p>
                <span
                  className={`${styles.modifyButton} ${styles.hasDeparted}`}
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
                    <p className={styles.hasDeparted}>총 보험료</p>
                    <span className={styles.hasDeparted}>
                      {formatPrice(parseInt(priceData?.DEPARTED?.ttPrem || 0))}
                      원
                    </span>
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

export default DptConfirm;
