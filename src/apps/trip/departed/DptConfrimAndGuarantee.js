import React, { useEffect, useState } from "react";
import styles from "../../../css/trip/confirm.module.css";
import { getGenderString } from "./DptGender";
import ModifyModal from "../../../components/modals/Modifymodal";
import {
  calculateInsuranceAge,
  calculateManAge,
  formatKoreanDate,
  formatPersonalId,
  getTodayYYYYMMDD,
} from "../../../utils/birthDate";
import { formatStringPrice } from "../../../utils/formatPrice";
import departedConfirmChk from "../../../assets/departedConfirmChk.svg";
import { useSelector } from "react-redux";

function DptConfirmAndGuarantee() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userAge, setUserAge] = useState("");
  const [userInsuranceAge, setUserInsuranceAge] = useState("");
  const [userPremium, setUserPremium] = useState(null);
  const [companionPremiums, setCompanionPremiums] = useState([]);
  const [isDataVisible, setIsDataVisible] = useState(false);

  // Redux Selectors
  const priceData = useSelector((state) => state.priceData.priceData);
  const companions = useSelector((state) => state.companions);
  const selectedStartDate = useSelector(
    (state) => state.calendar.selectedStartDate
  );
  const selectedEndDate = useSelector(
    (state) => state.calendar.selectedEndDate
  );
  const userDateOfBirth = useSelector((state) => state.user.dateOfBirth);
  const userGender = useSelector((state) => state.user.gender);
  const membersInfo = useSelector((state) => state.members.members);
  const companionDataInfo = membersInfo.companionData || [];
  const companionName = companionDataInfo.map((e) => e.name);

  useEffect(() => {
    if (!priceData?.DEPARTED) return;

    const departedData = priceData.DEPARTED.opapiGnrCoprCtrInspeInfCbcVo;
    setUserPremium(departedData[0].ppsPrem);
    setCompanionPremiums(
      departedData.slice(1).map((companion) => ({
        premium: companion.ppsPrem,
        dateOfBirth: companion.inspeBdt,
        gender: companion.gndrCd,
      }))
    );
  }, [priceData]);

  // 나이 계산 로직 수정
  useEffect(() => {
    if (userDateOfBirth) {
      // 현재 날짜를 YYYYMMDD 형식으로 구하기
      const today = getTodayYYYYMMDD();

      // 부보시기(여행 시작일)를 기준으로 보험나이 계산 (여행 시작일이 없을 경우 현재 날짜 사용)
      const baseDate = selectedStartDate || today;

      // 만 나이 계산
      const manAge = calculateManAge(userDateOfBirth, baseDate);
      setUserAge(manAge);

      // 보험나이 계산
      const insuranceAge = calculateInsuranceAge(userDateOfBirth, baseDate);
      setUserInsuranceAge(insuranceAge);
    }
  }, [userDateOfBirth, selectedStartDate]);

  const handleModifyClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const toggleDataVisibility = () => {
    setIsDataVisible(!isDataVisible);
  };

  return (
    <div className={styles.confirmContents}>
      <div className={styles.GuaranteeconfirmWrap}>
        <h3>
          선택하신{" "}
          <span className={styles.hasDeparteds}>
            보장내용
          </span>
          과{" "}
          <span className={styles.hasDeparteds}>
            보험료
          </span>
          를 <br />
          안내해드립니다.
        </h3>
        <section className={styles.on}>
          <div className={styles.sectionWrap}>
            <div className={styles.sectionWrap_title}>
              <div className={styles.ContentsImgWrap}>
                <img
                  src="/images/airport.png"
                  alt="출국 후 여행자 보험 로고"
                  className={styles.ContentsImg}
                />
              </div>
              <p className="text-xl font-semibold">
                출국 후 여행자 보험
              </p>
            </div>
            <div className={styles.section_DataContents}>
              <div className={styles.dataContext}>
                <p>가입내용</p>
                <span
                  onClick={handleModifyClick}
                  className={`${styles.modifyButton} ${styles.hasDeparted}`}
                >
                  수정하기
                </span>
              </div>
              <div className={styles.section_DataContentsWrap}>
                <div className={styles.dataFlexbox}>
                  <p>출발 일정일</p>
                  <span>{formatKoreanDate(selectedStartDate)}</span>
                </div>
                <div className={styles.dataFlexbox}>
                  <p>도착 일정일</p>
                  <span>{formatKoreanDate(selectedEndDate)}</span>
                </div>
                <div className={styles.dataFlexbox}>
                  <p>가입자</p>
                  <div className={styles.dataFlexCol}>
                    <span>
                      {getGenderString(userGender)} (만 {userAge}세 / 보험나이 {userInsuranceAge}세)
                      {companionPremiums.length > 0
                        ? ` 외 ${companionPremiums.length}명`
                        : ""}
                    </span>
                  </div>
                </div>
                <div className={styles.section_cost}>
                  <div className={styles.section_costWrap}>
                    <p className={styles.hasDeparted}>
                      총 보험료
                    </p>
                    <span className={styles.hasDeparted}>
                      {parseInt(
                        priceData?.DEPARTED?.ttPrem || 0
                      ).toLocaleString()}
                      원
                    </span>
                    <img
                      src={departedConfirmChk}
                      className="cursor-pointer ml-2"
                      onClick={toggleDataVisibility}
                      alt="confirmCheck"
                    />
                  </div>
                  <div
                    className={`bg-white rounded-xl w-full ${isDataVisible ? "" : "hidden"
                      } bg-opacity-0 py-4`}
                  >
                    <div className={styles.detailInfo}>
                      <div className={styles.TextFlex}>
                        <p>
                          {membersInfo.name}(계약자) :{" "}
                          {userPremium
                            ? `${formatStringPrice(userPremium)}원`
                            : "정보 없음"}
                        </p>
                        <p>{formatPersonalId(userDateOfBirth, userGender)}</p>
                      </div>
                      {companionPremiums.length > 0 &&
                        companions.map((companion, index) => (
                          <div key={index} className={styles.TextFlex}>
                            <p>
                              {companionName[index]}:{" "}
                              {formatStringPrice(
                                companionPremiums[index]?.premium
                              )}
                              원
                            </p>
                            <p>
                              {formatPersonalId(
                                companion.dateOfBirth,
                                companion.gender
                              )}
                            </p>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <ModifyModal isOpen={isModalOpen} onClose={closeModal} />
        </section>
      </div>
    </div>
  );
}

export default DptConfirmAndGuarantee;