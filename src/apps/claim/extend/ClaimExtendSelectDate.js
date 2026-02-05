// ClaimExtendSelectDate.js
import React, { useState } from "react";
import ClaimHeader from "../../claim/components/ClaimHeader";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "../../../css/claim/claimExtendSelectDate.module.css";
import ExtendCalendar from "./ExtendCalendar";
import dayjs from "dayjs";
import ClaimButton from "../../../components/buttons/ClaimButton";

function ClaimExtendSelectDate() {
  const location = useLocation();
  const filteredData = location.state || {};
  const navigate = useNavigate();

  const insuranceStartDate = filteredData?.insurance_start_date
    ? dayjs(filteredData?.insurance_start_date)
    : null;

  const insuranceEndDate = filteredData?.insurance_end_date
    ? dayjs(filteredData?.insurance_end_date)
    : null;

  const [modifyDate, setModifyDate] = useState("");
  const startDate = insuranceStartDate
    ? insuranceStartDate.format("YYYY-MM-DD")
    : null;

  const handleSelectDate = (date) => {
    const selectedDate = dayjs(date);
    setModifyDate(selectedDate.format("YYYY-MM-DD"));
  };

  const navigation = () => {
    navigate("/claimExtendCostChk", {
      state: { modifyDate, startDate, filteredData },
    });
  };

  return (
    <>
      <ClaimHeader titleText="여행기간 도착일 변경" />
      <div className={styles.container}>
        <div className={styles.containerWrap}>
          <div className={styles.contents}>
            <h3>
              변경하실 도착일 정보를
              <br /> 입력해주세요.
            </h3>
            <div className={styles.inputWrap}>
              <p>출발일</p>
              <ExtendCalendar
                initialDate={
                  insuranceStartDate
                    ? insuranceStartDate.format("YYYY-MM-DD")
                    : null
                }
                disabled={true}
              />
            </div>
            <div className={styles.inputWrap}>
              <p>도착일</p>
              <ExtendCalendar
                insuranceStartDate={insuranceStartDate}
                insuranceEndDate={insuranceEndDate}
                onSelect={handleSelectDate}
              />
            </div>
          </div>
        </div>
        <ClaimButton onClick={navigation} disabled={!modifyDate} />
      </div>
    </>
  );
}

export default ClaimExtendSelectDate;
