import React, { useState } from "react";
import ClaimHeader from "../../claim/components/ClaimHeader";
import styles from "../css/Claim/claimMembers.module.css";
import CustomInput from "../../components/common/CustomInput";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import SecureInputForm from "../../components/common/SecureInputForm";
import ClaimButton from "../../components/common/ClaimButton";

function ClaimMembers() {
  const navigate = useNavigate();
  const [error, setError] = useState({
    secretNumber: "",
  });
  const [BirthsecondPart, setSecondPart] = useState("");
  const token = useSelector((state) => state.cookie.cookie);
  const userName = token?.name || ""; // birth 값 추가 파싱 수정
  const userBirth = token?.birth || ""; // birth 값 추가 파싱 수정
  const sliceUserBirth = userBirth.slice(2);

  const handleSecretNumberChange = (BirthFirstPart, BirthsecondPart) => {
    let value = `${BirthFirstPart}${BirthsecondPart}`.replace(/[^0-9]/g, "");
    if (value.length > 12) {
      value = value.substring(0, 14);
    }
    if (value.length > 6) {
      const BirthFirstPart = value.substring(0, 6);
      const BirthsecondPart = value.substring(6);
      value = BirthFirstPart + "-" + BirthsecondPart; // Add '-' between parts
    }
    setSecondPart(value);
  };

  const isAllEmpty = () => {
    return !userName.trim() && !BirthsecondPart.trim();
  };

  const signUp = () => {
    navigate("/claimMembersInfo");
  };

  return (
    <>
      <ClaimHeader titleText="해외여행보험" />
      <div className={styles.section}>
        <div className={styles.sectionWrap}>
          <div className={styles.TextTitleWrap}>
            <h1>
              가입자 또는 <br /> 피보험자 정보를 입력해주세요.
            </h1>
            <p>미성년자는 가입자 정보를 입력해주세요.</p>
          </div>
          <div className={styles.formWrap}>
            <div className={styles.inputWrap}>
              <label className="">이름</label>
              <CustomInput readOnly value={userName} />
            </div>
            <div className={styles.inputWrap}>
              <label className={styles.styledLabel}>주민번호</label>
              <div className={styles.identifyNum}>
                <CustomInput
                  placeholder="앞자리"
                  value={sliceUserBirth}
                  readOnly
                />
                <div>
                  <span className="mx-1">-</span>
                </div>
                <SecureInputForm
                  inputType="residentNumber"
                  initialValue={BirthsecondPart}
                  placeholder="뒷자리"
                  maxLength={7}
                  readOnly={false}
                  error={error.secretNumber}
                  onChange={(value) => {
                    setSecondPart(value);
                    handleSecretNumberChange(sliceUserBirth, value);
                    setError({ ...error, secretNumber: "" });
                  }}
                  onClear={() => {
                    setSecondPart("");
                  }}
                  isValid={true} // Add validation logic if needed
                  buttonText="다음"
                />
              </div>
              {error.secretNumber && (
                <p style={{ color: "#E86565" }}>{error.secretNumber}</p>
              )}
            </div>
          </div>
          <ClaimButton
            onClick={signUp}
            disabled={isAllEmpty()}
            buttonText="다음"
          />
        </div>
      </div>
    </>
  );
}

export default ClaimMembers;
