import React, { useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Button from "../../../components/buttons/Button";
import DptInsertDate from "./DptInsertDate";
import DptGender from "./DptGender";
import styles from "../../../css/trip/insert.module.css";

function DptInsert({ faRetrustData }) {
  const startDate = useSelector((state) => state.calendar.selectedStartDate);
  const endDate = useSelector((state) => state.calendar.selectedEndDate);
  const gender = useSelector((state) => state.user.gender);
  const dateOfBirth = useSelector((state) => state.user.dateOfBirth);
  const companions = useSelector((state) => state.companions);
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState("");

  const handleNext = () => {
    navigate("/trip");
  };

  const companionsInfoValid = companions.every(
    (companion) =>
      companion.gender &&
      companion.dateOfBirth &&
      companion.dateOfBirth.length === 8
  );

  // 생년월일 8자리 체크 추가
  const isDateOfBirthValid = dateOfBirth && dateOfBirth.length === 8;

  return (
    <div className={styles.container}>
      <div className={styles.containerWrap}>
        <div className={styles.titltBox}>
          <div className={styles.titltWrap}>
            <h2 className={styles.title}>
              <span style={{ color: "#0E98F6" }}>보험료 계산</span>
              에 필요한 정보를
              <br /> 입력해주세요
            </h2>
            <div className={styles.tripSelect}>
              <DptInsertDate faRetrustData={faRetrustData} />
              <DptGender
                faRetrustData={faRetrustData}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
              />
            </div>
          </div>
        </div>
        <Button
          buttonText="다음"
          onClick={handleNext}
          disabled={
            !startDate ||
            !endDate ||
            !gender ||
            !dateOfBirth ||
            !companionsInfoValid ||
            !isDateOfBirthValid ||
            errorMessage
          }
        />
      </div>
    </div>
  );
}

export default DptInsert;
