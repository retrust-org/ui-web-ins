import React, { useState } from "react";
import styles from "../../../css/claim/receptionistInfo.module.css";
import CustomBorderInput from "../../../components/inputs/CustomBorderInput";
import { formatBirthDateInput } from "../../../utils/birthDate";
import {
  getContractorAgeMessage,
  validateName,
} from "../../../utils/validation";
import Button from "../../../components/buttons/Button";
import ClaimHeader from "../components/ClaimHeader";
import ParentChk from "./ParentChk";

function ReceptionistInfo() {
  const [formData, setFormData] = useState({
    name: "",
    dateOfBirth: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    dateOfBirth: "",
  });

  // 모달 상태 관리
  const [modalState, setModalState] = useState({
    isParentChkOpen: false,
    isAuthInProgress: false,
    authError: null,
  });

  // 이름 입력 핸들러
  const handleNameChange = (value) => {
    setFormData((prev) => ({ ...prev, name: value }));

    // 실시간 유효성 검사
    const nameError = validateName(value);
    setErrors((prev) => ({ ...prev, name: nameError }));
  };

  // 생년월일 입력 핸들러
  const handleDateOfBirthChange = (value) => {
    // 숫자만 입력되도록 포맷팅
    const formattedValue = formatBirthDateInput(value);

    // 8자리까지만 입력 허용
    if (formattedValue.length <= 8) {
      setFormData((prev) => ({ ...prev, dateOfBirth: formattedValue }));

      // 8자리 입력 완료 시 유효성 검사
      if (formattedValue.length === 8) {
        const birthError = getContractorAgeMessage(formattedValue);
        setErrors((prev) => ({ ...prev, dateOfBirth: birthError }));
      } else {
        // 8자리 미만일 때는 에러 초기화
        setErrors((prev) => ({ ...prev, dateOfBirth: "" }));
      }
    }
  };

  // 이름 입력창 클리어
  const handleNameClear = () => {
    setFormData((prev) => ({ ...prev, name: "" }));
    setErrors((prev) => ({ ...prev, name: "" }));
  };

  // 생년월일 입력창 클리어
  const handleDateOfBirthClear = () => {
    setFormData((prev) => ({ ...prev, dateOfBirth: "" }));
    setErrors((prev) => ({ ...prev, dateOfBirth: "" }));
  };

  // 버튼 비활성화 여부 판단 함수
  const isButtonDisabled = () => {
    // 필수 입력값이 비어있는 경우
    if (!formData.name.trim() || !formData.dateOfBirth.trim()) {
      return true;
    }

    // 생년월일이 8자리가 아닌 경우
    if (formData.dateOfBirth.length !== 8) {
      return true;
    }

    // 유효성 검사 에러가 있는 경우
    if (errors.name || errors.dateOfBirth) {
      return true;
    }

    return false;
  };

  // 폼 제출 핸들러
  const handleSubmit = () => {
    // 최종 유효성 검사
    const nameError = validateName(formData.name);
    const birthError =
      formData.dateOfBirth.length === 8
        ? getContractorAgeMessage(formData.dateOfBirth)
        : "생년월일 8자리를 올바르게 입력해주세요";

    setErrors({
      name: nameError,
      dateOfBirth: birthError,
    });

    // 에러가 없을 때만 ParentChk 모달 열기
    if (!nameError && !birthError) {
      console.log("폼 제출:", formData);
      setModalState((prev) => ({
        ...prev,
        isParentChkOpen: true,
        authError: null, // 이전 에러 초기화
      }));
    }
  };

  // ParentChk 모달 닫기 핸들러
  const handleCloseParentChk = () => {
    setModalState((prev) => ({
      ...prev,
      isParentChkOpen: false,
      isAuthInProgress: false,
      authError: null,
    }));
  };

  // 본인인증 시작 핸들러
  const handleAuthStart = () => {
    setModalState((prev) => ({
      ...prev,
      isAuthInProgress: true,
      authError: null,
    }));
  };

  // 본인인증 완료 핸들러 (성공 시)
  const handleAuthSuccess = () => {
    setModalState((prev) => ({
      ...prev,
      isParentChkOpen: false,
      isAuthInProgress: false,
      authError: null,
    }));
  };

  // 본인인증 실패 핸들러
  const handleAuthError = (errorMessage) => {
    setModalState((prev) => ({
      ...prev,
      isAuthInProgress: false,
      authError: errorMessage,
    }));
  };

  // 에러 모달 닫기 핸들러
  const handleCloseErrorModal = () => {
    setModalState((prev) => ({
      ...prev,
      authError: null,
    }));
  };

  return (
    <>
      <ClaimHeader titleText="청구하기" />
      <div className={styles.receptionistInfoContainer}>
        <section className={styles.receptionistInfoSection}>
          <h2>접수자 정보를 알려주세요</h2>
          <div className={styles.InputGroup}>
            <div className={styles.inputWrap}>
              <CustomBorderInput
                placeholder="접수자 성함을 입력해주세요"
                value={formData.name}
                onChange={handleNameChange}
                onClear={handleNameClear}
                maxLength={150}
                error={errors.name}
              />
            </div>

            <div className={styles.inputWrap}>
              <CustomBorderInput
                placeholder="생년월일을 입력해주세요 예)19991111"
                value={formData.dateOfBirth}
                onChange={handleDateOfBirthChange}
                onClear={handleDateOfBirthClear}
                error={errors.dateOfBirth}
                maxLength={8}
                type="tel"
              />
            </div>
          </div>
        </section>
        <Button
          onClick={handleSubmit}
          disabled={isButtonDisabled()}
          buttonText="본인인증하기"
        />
      </div>

      {/* ParentChk 모달 */}
      {modalState.isParentChkOpen && (
        <ParentChk
          onClose={handleCloseParentChk}
          receptionistInfo={formData}
          isAuthInProgress={modalState.isAuthInProgress}
          onAuthStart={handleAuthStart}
          onAuthSuccess={handleAuthSuccess}
          onAuthError={handleAuthError}
        />
      )}
    </>
  );
}

export default ReceptionistInfo;
