// Member.js
import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Button from "../../../components/buttons/Button";
import CustomInput from "../../../components/inputs/CustomInput";
import AgreeTerms from "./DptAgreeTerms";
import styles from "../../../css/trip/member.module.css";
import { useNavigate } from "react-router-dom";
import { setMembersData, setUserFormData } from "../../../redux/store";
import {
  formatEnglishName,
  formatPhoneNumber,
  formatEmail,
  getGenderCode,
  isAllFieldsEmpty,
} from "../../../utils/regex";
import { validateUserForm } from "../../../utils/validation";
import { useAgreeTermsModal } from "../../../hooks/useAgreeTermsModal";
import { useReOrderData } from "../../../appEntryFactory"; // Context 훅 추가

function Member() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const companions = useSelector((state) => state.companions);
  const dateOfBirth = useSelector((state) => state.user.dateOfBirth);
  const gender = useSelector((state) => state.user.gender);
  const personalInfo = useSelector((state) => state.personalInfo);
  const userFormData = useSelector((state) => state.userForm);

  // Context에서 reOrderData 가져오기
  const reOrderData = useReOrderData();
  const reOrderUserData = reOrderData?.user || {};

  const { showModal, handleInitializeModal, handleCloseModal } =
    useAgreeTermsModal();

  const [name, setName] = useState(
    userFormData.name || personalInfo.koreanName || reOrderUserData.name || ""
  );
  const [englishName, setEnglishName] = useState(
    (
      userFormData.englishName ||
      personalInfo.englishName ||
      reOrderUserData.name_english ||
      ""
    ).toUpperCase()
  );
  const [phoneNumber, setPhoneNumber] = useState(
    userFormData.phoneNumber ||
      personalInfo.phoneNumber ||
      reOrderUserData.phone ||
      ""
  );
  const [email, setEmail] = useState(
    userFormData.email || personalInfo.email || reOrderUserData.email || ""
  );

  const [error, setError] = useState({
    name: "",
    englishName: "",
    phoneNumber: "",
    email: "",
  });

  const formattedDate = dateOfBirth.slice(2, 8);

  useEffect(() => {
    dispatch(setUserFormData({ name, englishName, phoneNumber, email }));
  }, [name, englishName, phoneNumber, email, dispatch]);

  useEffect(() => {
    if (personalInfo) {
      if (personalInfo.koreanName) setName(personalInfo.koreanName);
      if (personalInfo.englishName)
        setEnglishName(personalInfo.englishName.toUpperCase());
      if (personalInfo.phoneNumber) setPhoneNumber(personalInfo.phoneNumber);
      if (personalInfo.email) setEmail(personalInfo.email);
    }
  }, [personalInfo]);

  // reOrderData 데이터로 필드 초기화
  useEffect(() => {
    if (reOrderData && reOrderUserData) {
      if (reOrderUserData.name && !name) setName(reOrderUserData.name);
      if (reOrderUserData.name_english && !englishName)
        setEnglishName(reOrderUserData.name_english.toUpperCase());
      if (reOrderUserData.phone && !phoneNumber)
        setPhoneNumber(reOrderUserData.phone);
      if (reOrderUserData.email && !email) setEmail(reOrderUserData.email);
    }
  }, [reOrderData, reOrderUserData]);

  const handleEnglishNameChange = (value) => {
    setEnglishName(formatEnglishName(value));
  };

  const handlePhoneNumberChange = (value) => {
    setPhoneNumber(formatPhoneNumber(value));
  };

  const handleEmailChange = (value) => {
    setEmail(formatEmail(value));
  };

  const isAllEmpty = () => {
    return isAllFieldsEmpty({ name, englishName, phoneNumber, email });
  };

  const signUp = async (e) => {
    if (e) {
      e.preventDefault();
    }

    const { isValid, errors } = validateUserForm({
      name,
      englishName,
      phoneNumber,
      email,
    });

    setError(errors);

    if (isValid) {
      const queryData = {
        name,
        englishName,
        phoneNumber,
        email,
        dateOfBirth,
      };

      if (companions && companions.length > 0) {
        navigate("/signup/companionmembers", { state: queryData });
      } else {
        dispatch(setMembersData(queryData));
        handleInitializeModal();
      }
    }
  };

  return (
    <div>
      <section className="w-full">
        <form className={styles.memberForm} onSubmit={signUp}>
          <h3 className={styles.H3_title}>
            보험가입에 필요한{" "}
            <span className={styles.hasDeparted}>계약자 정보</span>
            를 <br />
            제공해주세요
          </h3>
          <div className={styles.inputWrap}>
            <label className={styles.styledLabel}>이름</label>
            <CustomInput
              placeholder="이름(3~4자)"
              maxLength={80}
              value={name}
              error={error.name}
              onChange={(value) => setName(value)}
              onClear={() => setName("")}
            />
            {error.name && (
              <p style={{ marginTop: "8px", color: "#E86565" }}>{error.name}</p>
            )}
          </div>
          <div className={styles.inputWrap}>
            <label className={styles.styledLabel}>주민번호</label>
            <div className={styles.identifyNum}>
              <CustomInput
                placeholder="앞자리"
                readOnly
                value={formattedDate}
              />
              <div>
                <span>-</span>
              </div>
              <CustomInput
                placeholder="뒷자리"
                readOnly
                value={getGenderCode(dateOfBirth, gender) + "******"}
              />
            </div>
          </div>
          <div className={styles.inputWrap}>
            <label className={styles.styledLabel}>
              영문명 (영문가입 증명서용)
            </label>
            <CustomInput
              placeholder="(여권과 동일하게 입력 하세요.)"
              maxLength={150}
              value={englishName}
              error={error.englishName}
              onChange={handleEnglishNameChange}
              onClear={() => setEnglishName("")}
            />
            {error.englishName && (
              <p style={{ marginTop: "8px", color: "#E86565" }}>
                {error.englishName}
              </p>
            )}
          </div>
          <div className={styles.inputWrap}>
            <label className={styles.styledLabel}>휴대폰 번호</label>
            <CustomInput
              placeholder="'-'빼고 입력해주세요."
              type="tel"
              maxLength={13}
              value={phoneNumber}
              onChange={handlePhoneNumberChange}
              onClear={() => setPhoneNumber("")}
              error={error.phoneNumber}
            />
            {error.phoneNumber && (
              <p style={{ marginTop: "8px", color: "#E86565" }}>
                {error.phoneNumber}
              </p>
            )}
          </div>
          <div className={styles.inputWrap}>
            <label className={styles.styledLabel}>이메일</label>
            <CustomInput
              placeholder="이메일"
              type="email"
              maxLength={25}
              value={email}
              onChange={handleEmailChange}
              onClear={() => setEmail("")}
              error={error.email}
            />
            {error.email && (
              <p style={{ marginTop: "8px", color: "#E86565" }}>
                {error.email}
              </p>
            )}
          </div>
        </form>
      </section>
      <div className="py-4">
        <Button
          buttonText={
            companions && companions.length > 0
              ? "동반인 정보 입력"
              : "가입하기"
          }
          onClick={signUp}
          disabled={isAllEmpty()}
        />
      </div>
      {showModal && (
        <AgreeTerms isOpen={showModal} onClose={handleCloseModal} />
      )}
    </div>
  );
}
export default Member;
