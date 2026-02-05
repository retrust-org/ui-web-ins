import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { login, logout } from "../../../redux/store";
import ClaimHeader from "../../claim/components/ClaimHeader";
import styles from "../../../css/claim/claimMembers.module.css";
import CustomInput from "../../../components/inputs/CustomInput";
import { useNavigate } from "react-router-dom";
import ClaimButton from "../../../components/buttons/ClaimButton";

function ClaimLogin() {
  const navigate = useNavigate();
  const dispatch = useDispatch(); // useDispatch 훅 추가

  const [error, setError] = useState({
    name: "",
    // secretNumber: "",
    phoneNumber: "",
  });
  const [name, setName] = useState("");
  // const [BirthFirstPart, setFirstPart] = useState("");
  // const [BirthsecondPart, setSecondPart] = useState("");
  // const [secretNumber, setSecretNumber] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // const handleSecretNumberChange = (BirthFirstPart, BirthsecondPart) => {
  //   let value = `${BirthFirstPart}${BirthsecondPart}`.replace(/[^0-9]/g, "");
  //   if (value.length > 12) {
  //     value = value.substring(0, 14);
  //   }
  //   if (value.length > 6) {
  //     const BirthFirstPart = value.substring(0, 6);
  //     const BirthsecondPart = value.substring(6);
  //     value = BirthFirstPart + "-" + BirthsecondPart; // Add '-' between parts
  //   }
  //   setSecretNumber(value);
  // };

  const handlePhoneNumberChange = (value) => {
    value = value
      .replace(/[^0-9]/g, "")
      .replace(/^(\d{0,3})(\d{0,4})(\d{0,4})$/g, "$1-$2-$3")
      .replace(/-{1,2}$/g, "");
    setPhoneNumber(value);
  };

  // const isValidSecretNumber = (secretNumber) => {
  //   const regex = /^[0-9]{6}-[1-4][0-9]{6}$/;
  //   return regex.test(secretNumber);
  // };

  // const isValidKoreanName = (name) => {
  //   const koreanRegex = /^[가-힣]+$/;
  //   return koreanRegex.test(name);
  // };

  const isValidPhone = (phoneNumber) => {
    const regex = /^01[0-9]-[0-9]{3,4}-[0-9]{4}$/;
    return regex.test(phoneNumber);
  };

  // const isAllEmpty = () => {
  //   return !name.trim() && !secretNumber.trim() && !phoneNumber.trim();
  // };

  const signUp = () => {
    let valid = true;
    const newErrors = {
      name: "",
      secretNumber: "",
      phoneNumber: "",
    };

    // if (!isValidKoreanName(name)) {
    //   newErrors.name = "올바른 이름을 입력하세요.";
    //   valid = false;
    // }

    // if (!isValidSecretNumber(secretNumber)) {
    //   newErrors.secretNumber = "유효하지 않은 주민등록번호입니다.";
    //   valid = false;
    // }

    if (!isValidPhone(phoneNumber)) {
      newErrors.phoneNumber = "존재하지 않는 전화번호입니다.";
      valid = false;
    }

    if (!valid) {
      setError(newErrors);
      return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      name: name,
      phone: phoneNumber,
      // national_id: secretNumber.replace(/-/g, ""),
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    fetch(
      `${process.env.REACT_APP_BASE_URL}/trip-api/auth/getToken`,
      requestOptions
    )
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to authenticate");
        }
        return response.text();
      })
      .then((result) => {
        dispatch(login(result)); // 로그인 액션 디스패치
        navigate("/");
      })
      .catch((error) => {
        console.error("Error:", error);
        dispatch(logout()); // 로그아웃 액션 디스패치
        navigate("/claimLogin"); // 로그인 페이지로 리디렉션
      });
  };

  return (
    <>
      <ClaimHeader titleText="해외여행보험" />
      <div className={styles.section}>
        <div className={styles.sectionWrap}>
          <div className={`${styles.TextTitleWrap} ${styles.TextTitleWraps}`}>
            <h1>로그인 정보를 입력해주세요.</h1>
          </div>
          <div className={styles.formWrap}>
            <div className={styles.inputWrap}>
              <label className="">이름</label>
              <CustomInput
                placeholder="이름"
                maxLength={80}
                value={name}
                error={error.name}
                onChange={(value) => {
                  setName(value); // Update name state
                  setError({ ...error, name: "" }); // Clear name error
                }}
                onClear={() => {
                  setName("");
                }}
              />
              {error.name && <p style={{ color: "#E86565" }}>{error.name}</p>}
            </div>
            {/* <div className={styles.inputWrap}>
              <label className={styles.styledLabel}>주민번호</label>
              <div className={styles.identifyNum}>
                <CustomInput
                  placeholder="앞자리"
                  error={error.secretNumber}
                  type="tel"
                  maxLength={6}
                  value={BirthFirstPart}
                  onChange={(value) => {
                    setFirstPart(value); // Update first part state
                    handleSecretNumberChange(value, BirthsecondPart); // Update secretNumber state
                    setError({ ...error, secretNumber: "" }); // Clear secretNumber error
                  }}
                  onClear={() => {
                    setFirstPart("");
                  }}
                />
                <div>
                  <span className="mx-1">-</span>
                </div>
                <CustomInput
                  placeholder="뒷자리"
                  maxLength={7}
                  type="tel"
                  error={error.secretNumber}
                  value={BirthsecondPart}
                  onChange={(value) => {
                    setSecondPart(value);
                    handleSecretNumberChange(BirthFirstPart, value);
                    setError({ ...error, secretNumber: "" });
                  }}
                  onClear={() => {
                    setSecondPart("");
                  }}
                />
              </div>
              {error.secretNumber && (
                <p style={{ color: "#E86565" }}>{error.secretNumber}</p>
              )}
            </div> */}
            <div className={styles.inputWrap}>
              <label className={styles.styledLabel}>휴대폰 번호</label>
              <CustomInput
                placeholder="'-'빼고 입력해주세요."
                type="tel"
                maxLength={13}
                value={phoneNumber}
                onChange={(value) => {
                  setPhoneNumber(value);
                  handlePhoneNumberChange(value);
                  setError({ ...error, phoneNumber: "" });
                }}
                onClear={() => {
                  setPhoneNumber("");
                }}
                error={error.phoneNumber}
              />
              {error.phoneNumber && (
                <p style={{ color: "#E86565" }}>{error.phoneNumber}</p>
              )}
            </div>
          </div>
          <ClaimButton onClick={signUp} buttonText="다음" />
        </div>
      </div>
    </>
  );
}

export default ClaimLogin;
