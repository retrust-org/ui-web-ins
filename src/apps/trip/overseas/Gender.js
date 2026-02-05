import React, { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import {
  setGender,
  setDateOfBirth,
  addCompanion,
  updateCompanionGender,
  updateCompanionDateOfBirth,
  deleteCompanion,
} from "../../../redux/store";
import styles from "../../../css/trip/insert.module.css";
import commonDownArrow from "../../../assets/commonDownArrow.svg";
import plus from "../../../assets/plus.svg";
import { formatBirthDateInput } from "../../../utils/birthDate";
import {
  getOverseasContractorAgeMessage,
  getOverseasCompanionAgeMessage,
} from "../../../utils/validation";
import { useReOrderData } from "../../../appEntryFactory";

const gndrCd = {
  남자: "1",
  여자: "2",
};

export const getGenderString = (genderCode) => {
  if (!genderCode) {
    return "성별선택";
  }
  return genderCode === "1" ? "남" : "여";
};

const Gender = ({ faRetrustData, errorMessage, setErrorMessage }) => {
  const [companionErrors, setCompanionErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isCompanionDropdownOpen, setIsCompanionDropdownOpen] = useState({});
  const userInfo = useSelector((state) => state.user);
  const companions = useSelector((state) => state.companions);
  const dispatch = useDispatch();
  const dropdownRef = useRef(null);

  // Context에서 reOrderData 가져오기
  const reOrderData = useReOrderData();
  const reOrderUserData = reOrderData?.user;

  useEffect(() => {
    if (faRetrustData) {
      if (faRetrustData.gender === "male") {
        dispatch(setGender("1"));
      } else if (faRetrustData.gender === "female") {
        dispatch(setGender("2"));
      }
      if (faRetrustData.birthDate) {
        dispatch(setDateOfBirth(faRetrustData.birthDate));
      }
    }
  }, [faRetrustData, dispatch]);

  useEffect(() => {
    if (reOrderData && reOrderUserData) {
      if (reOrderUserData.gender === 1 || reOrderUserData.gender === 2) {
        dispatch(setGender(reOrderUserData.gender.toString()));
      }
      if (reOrderUserData.birth) {
        dispatch(setDateOfBirth(reOrderUserData.birth));
      }
    }
  }, [reOrderData, reOrderUserData, dispatch]);

  useEffect(() => {
    // 가입자 생년월일 체크 (해외여행보험용 79세 제한)
    if (userInfo.dateOfBirth.length === 8) {
      const message = getOverseasContractorAgeMessage(userInfo.dateOfBirth);
      setErrorMessage(message);
    } else {
      setErrorMessage("");
    }

    // 동반인 생년월일 체크 (해외여행보험용 79세 제한)
    companions.forEach((companion, index) => {
      if (companion.dateOfBirth.length === 8) {
        const message = getOverseasCompanionAgeMessage(companion.dateOfBirth);
        setCompanionErrors((prev) => ({
          ...prev,
          [index]: message ? `동반인 ${index + 1}의 ${message}` : "",
        }));
      } else {
        setCompanionErrors((prev) => ({
          ...prev,
          [index]: "",
        }));
      }
    });
  }, [userInfo.dateOfBirth, companions, setErrorMessage]);

  const handleDateOfBirthChange = (e) => {
    if (!faRetrustData?.birthDate && !reOrderUserData?.birth) {
      const value = e.target.value;
      const formattedValue = formatBirthDateInput(value);
      dispatch(setDateOfBirth(formattedValue));
    }
  };

  const handleCompanionDateOfBirthChange = (e, index) => {
    const value = e.target.value;
    const formattedValue = formatBirthDateInput(value);
    dispatch(
      updateCompanionDateOfBirth({ index, dateOfBirth: formattedValue })
    );
  };

  const addNewCompanion = () => {
    dispatch(addCompanion({ gender: "", dateOfBirth: "" }));
    setIsCompanionDropdownOpen((prev) => ({
      ...prev,
      [companions.length]: false,
    }));
  };

  const handleGenderSelect = (gender) => {
    if (!faRetrustData?.gender && !reOrderUserData?.gender) {
      dispatch(setGender(gndrCd[gender]));
    }
    setIsDropdownOpen(false);
  };

  const handleCompanionGenderSelect = (gender, index) => {
    dispatch(updateCompanionGender({ index, gender: gndrCd[gender] }));
    setIsCompanionDropdownOpen((prev) => ({ ...prev, [index]: false }));
  };

  return (
    <section className={styles.sectionGender}>
      <div className={styles.genderContentsBox}>
        <div className={styles.UserInfoBox}>
          <p className={styles.userInfo}>가입자 정보</p>
          <p className={styles.companionsTotal} style={{ color: "#386937" }}>
            동반인 :{companions.length}명
          </p>
        </div>
        <div className={styles.userInpoInputFlex}>
          <div className={styles.inputWrapper}>
            <input
              value={faRetrustData?.birthDate || userInfo.dateOfBirth}
              onChange={handleDateOfBirthChange}
              maxLength={8}
              type="tel"
              placeholder="예시 : 19910211"
              className={`${styles.InputContent} ${
                errorMessage ? styles.inputError : ""
              }`}
              readOnly={!!(faRetrustData?.birthDate || reOrderUserData?.birth)}
            />
            {errorMessage && (
              <p className={styles.errorMessage}>{errorMessage}</p>
            )}
          </div>
          <div className={styles.inputWrapper}>
            <div className={styles.genderInput} ref={dropdownRef}>
              <input
                value={getGenderString(userInfo.gender)}
                readOnly
                placeholder="성별"
                className={styles.InputContent}
                style={
                  !userInfo.gender
                    ? { color: "#B8B9BC", fontWeight: "400" }
                    : {}
                }
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              />
              <div
                className={styles.faCheckStyle}
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <img src={commonDownArrow} alt="가입자 성별 선택" />
              </div>
              {isDropdownOpen &&
                !faRetrustData?.gender &&
                !reOrderUserData?.gender && (
                  <div className={styles.GenderOption}>
                    <button
                      onClick={() => handleGenderSelect("남자")}
                      className={styles.genderBtn}
                      role="menuitem"
                    >
                      남
                    </button>
                    <button
                      onClick={() => handleGenderSelect("여자")}
                      className={styles.genderBtn}
                      role="menuitem"
                    >
                      여
                    </button>
                  </div>
                )}
            </div>
          </div>
        </div>
      </div>

      {companions.map((companion, index) => (
        <div key={index}>
          <div className={styles.companionIndex_DeleteBtn}>
            <p className={styles.companionIndex}>동반인{index + 1}</p>
            <span
              className={styles.DeleteBtn}
              onClick={() => dispatch(deleteCompanion(index))}
            >
              삭제
            </span>
          </div>
          <div className={styles.InputFlex}>
            <div className={styles.inputWrapper}>
              <input
                value={companion.dateOfBirth}
                onChange={(e) => handleCompanionDateOfBirthChange(e, index)}
                maxLength={8}
                type="tel"
                placeholder="예시 : 19910211"
                className={`${styles.InputContent} ${
                  companionErrors[index] ? styles.inputError : ""
                }`}
              />
              {companionErrors[index] && (
                <p className={styles.errorMessage}>{companionErrors[index]}</p>
              )}
            </div>
            <div className={styles.inputWrapper}>
              <div className={styles.genderInput}>
                <input
                  value={getGenderString(companion.gender)}
                  readOnly
                  className={styles.InputContent}
                  onClick={() =>
                    setIsCompanionDropdownOpen((prev) => ({
                      ...prev,
                      [index]: !prev[index],
                    }))
                  }
                />
                <div
                  className={styles.companionCheckicon}
                  onClick={() =>
                    setIsCompanionDropdownOpen((prev) => ({
                      ...prev,
                      [index]: !prev[index],
                    }))
                  }
                >
                  <img src={commonDownArrow} alt="동반인 성별 선택" />
                </div>
                {isCompanionDropdownOpen[index] && (
                  <div className={styles.GenderOption}>
                    <button
                      onClick={() => handleCompanionGenderSelect("남자", index)}
                      className={styles.genderBtn}
                      role="menuitem"
                    >
                      남
                    </button>
                    <button
                      onClick={() => handleCompanionGenderSelect("여자", index)}
                      className={styles.genderBtn}
                      role="menuitem"
                    >
                      여
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}

      <div
        className={styles.AddcopanionButtonWrap}
        onClick={addNewCompanion}
        style={{
          backgroundColor: "#ebf0eb",
        }}
      >
        <img src={plus} alt="추가하기 버튼" />
        <button
          className={styles.AddcopanionButton_Text}
          style={{
            color: "#386937",
          }}
        >
          동반인 추가하기
        </button>
      </div>
    </section>
  );
};

export default Gender;