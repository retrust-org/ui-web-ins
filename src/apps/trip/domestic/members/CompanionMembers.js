import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import CustomInput from "../../../../components/inputs/CustomInput";
import styles from "../../../../css/trip/member.module.css";
import { useLocation } from "react-router-dom";
import Button from "../../../../components/buttons/Button";
import AgreeTerms from "../../longterm/agree/AgreeTerms";
import { setMembersData } from "../../../../redux/store";
import {
  formatEnglishName,
  formatPhoneNumber,
  formatEmail,
  getGenderCode,
} from "../../../../utils/regex";
import { validateCompanionForms } from "../../../../utils/validation";
import { useAgreeTermsModal } from "../../../../hooks/useAgreeTermsModal";

function CompanionMembers() {
  const dispatch = useDispatch();
  const companions = useSelector((state) => state.companions) || [];
  const location = useLocation();
  const queryData = location.state;
  const { showModal, handleInitializeModal, handleCloseModal } =
    useAgreeTermsModal();
  const companionsBirth = companions?.map((e) => e.dateOfBirth) || [];
  const companionsGender = companions?.map((e) => e.gender) || [];

  const initialState = {
    name: "",
    phoneNumber: "",
    email: "",
  };

  const [members, setMembers] = useState(() => {
    if (companions.length > 0) {
      return companions.map((companion) => ({
        name: companion.koreanName || "",
        phoneNumber: companion.phoneNumber || "",
        email: companion.email || "",
      }));
    }
    return Array(companions.length).fill(initialState);
  });

  const [errors, setErrors] = useState(
    Array(companions.length).fill(initialState)
  );

  useEffect(() => {
    if (members.length !== companions.length) {
      if (members.length < companions.length) {
        setMembers([
          ...members,
          ...Array(companions.length - members.length).fill(initialState),
        ]);
      } else {
        setMembers(members.slice(0, companions.length));
      }
    }
  }, [companions.length]);

  const handleInputChange = (index, key, value) => {
    const updatedMembers = [...members];
    updatedMembers[index] = { ...updatedMembers[index], [key]: value };
    setMembers(updatedMembers);
  };

  const handleInputClear = (index, key) => {
    const updatedMembers = [...members];
    updatedMembers[index] = { ...updatedMembers[index], [key]: "" };
    setMembers(updatedMembers);
  };

  const handlePhoneNumberChange = (value, index) => {
    handleInputChange(index, "phoneNumber", formatPhoneNumber(value));
  };

  const handleEmailChange = (value, index) => {
    handleInputChange(index, "email", formatEmail(value));
  };

  const isAllEmpty = () => {
    return members.every(
      (member) =>
        !member.name.trim() &&
        !member.phoneNumber.trim() &&
        !member.email.trim()
    );
  };

  const signUp = async (e) => {
    if (e) {
      e.preventDefault();
    }

    const { isValid, errors: validationErrors } =
      validateCompanionForms(members);
    setErrors(validationErrors);

    if (isValid) {
      const companionData = members.map((member, index) => ({
        name: member.name,
        phoneNumber: member.phoneNumber,
        email: member.email,
        dateOfBirth: companionsBirth[index],
        gender: companionsGender[index],
      }));

      const userDataAndCompanionData = {
        ...queryData,
        companionData: companionData,
      };
      dispatch(setMembersData(userDataAndCompanionData));
      handleInitializeModal();
    }
  };

  return (
    <>
      <section className="w-full">
        <form className={styles.memberForm}>
          <h3 className={styles.H3_title}>
            보험가입에 필요한 동반인 정보를
            <br /> 제공해주세요
          </h3>
          {companions.length > 0 ? (
            members.map((member, index) => (
              <div key={index} className={styles.membersForm}>
                <p className="text-[#386937] font-semibold">
                  동반인 {index + 1}
                </p>
                <div className={styles.inputWrap}>
                  <label className={styles.styledLabel}>이름</label>
                  <CustomInput
                    placeholder="이름"
                    maxLength={80}
                    value={member.name}
                    error={errors[index]?.name}
                    onChange={(value) =>
                      handleInputChange(index, "name", value)
                    }
                    onClear={() => handleInputClear(index, "name")}
                  />
                  {errors[index]?.name && (
                    <p style={{ marginTop: "8px", color: "#E86565" }}>
                      {errors[index].name}
                    </p>
                  )}
                </div>
                <div className={styles.inputWrap}>
                  <label className={styles.styledLabel}>주민번호</label>
                  <div className={styles.identifyNum}>
                    <CustomInput
                      placeholder="앞자리"
                      value={companionsBirth[index]?.substring(2) || ""}
                      readOnly
                    />
                    <div>
                      <span>-</span>
                    </div>
                    <CustomInput
                      placeholder="뒷자리"
                      value={
                        companionsBirth[index] && companionsGender[index]
                          ? getGenderCode(
                              companionsBirth[index],
                              companionsGender[index]
                            ) + "******"
                          : "******"
                      }
                      readOnly
                    />
                  </div>
                </div>
                <div className={styles.inputWrap}>
                  <label className={styles.styledLabel}>전화번호</label>
                  <CustomInput
                    placeholder="전화번호"
                    type="tel"
                    maxLength={13}
                    value={member.phoneNumber}
                    onChange={(value) => handlePhoneNumberChange(value, index)}
                    onClear={() => handleInputClear(index, "phoneNumber")}
                    error={errors[index]?.phoneNumber}
                  />
                  {errors[index]?.phoneNumber && (
                    <p style={{ marginTop: "8px", color: "#E86565" }}>
                      {errors[index].phoneNumber}
                    </p>
                  )}
                </div>
                <div className={styles.inputWrap}>
                  <label className={styles.styledLabel}>이메일</label>
                  <CustomInput
                    placeholder="이메일"
                    type="email"
                    maxLength={25}
                    value={member.email}
                    onChange={(value) => handleEmailChange(value, index)}
                    onClear={() => handleInputClear(index, "email")}
                    error={errors[index]?.email}
                  />
                  {errors[index]?.email && (
                    <p style={{ marginTop: "8px", color: "#E86565" }}>
                      {errors[index].email}
                    </p>
                  )}
                </div>
                {companions.length > 1 && index < companions.length - 1 && (
                  <div className="py-2">
                    <div className="w-full h-2 bg-[#DBE5DB] absolute left-0"></div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-8">
              <p>동반인 정보가 없습니다.</p>
            </div>
          )}
        </form>
      </section>
      {companions.length > 0 && (
        <div className="py-4">
          <Button
            buttonText="가입하기"
            onClick={signUp}
            disabled={isAllEmpty()}
          />
        </div>
      )}
      {showModal && <AgreeTerms isOpen={true} onClose={handleCloseModal} />}
    </>
  );
}

export default CompanionMembers;
