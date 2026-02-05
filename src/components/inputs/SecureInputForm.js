import React, { useState } from "react";
import CommonSecureKeyboard from "../../components/secureKeyboards/CommonSecureKeyboard";
import Loading from "../../components/loadings/Loading";
import usePublicKey from "../../data/PublicGetApi";
import createPostData from "../../data/CreatePostData";
import ErrorModal from "../modals/ErrorModal";

const validateResidentNumber = (residentNumber) => {
  if (residentNumber.length !== 13) {
    return false;
  }
  const digits = residentNumber.slice(0, -1).split("").map(Number);
  const multipliers = [2, 3, 4, 5, 6, 7, 8, 9, 2, 3, 4, 5];
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    sum += digits[i] * multipliers[i];
  }
  const remainder = sum % 11;
  let checkDigit = 11 - remainder;
  if (checkDigit >= 10) {
    checkDigit -= 10;
  }
  return checkDigit === Number(residentNumber.slice(-1));
};

const SecureInputForm = ({
  initialValue = "",
  placeholder,
  error,
  onChange,
  onClick,
  maxLength,
  maskValue,
  selectedBirth,
  userSecretNum, // 미성년 자녀용 13자리 주민번호
}) => {
  const publicKey = usePublicKey();
  const [loading, setLoading] = useState(false);
  const [localValue, setLocalValue] = useState(initialValue);
  const [modalError, setModalError] = useState(null);

  const handleEncryption = async () => {
    if (loading) return;

    try {
      setLoading(true);
      if (!publicKey) {
        throw new Error("유효하지 않는 접근입니다.");
      }

      let encryptedData = "";
      let valueToEncrypt = "";

      if (maskValue === "secret") {
        // 기존 주민등록번호 뒷자리 처리
        const birthDate = selectedBirth ? selectedBirth.slice(2) : "";
        valueToEncrypt = birthDate + localValue;

        if (
          valueToEncrypt.length !== 13 ||
          !validateResidentNumber(valueToEncrypt)
        ) {
          throw new Error("유효하지 않은 주민등록번호입니다.");
        }
      } else if (maskValue === "minorChild") {
        // 미성년 자녀 13자리 주민등록번호 처리
        valueToEncrypt = userSecretNum;

        if (!valueToEncrypt || valueToEncrypt.length !== 13) {
          throw new Error("주민등록번호 13자리를 입력해주세요.");
        }

        if (!validateResidentNumber(valueToEncrypt)) {
          throw new Error("유효하지 않은 주민등록번호입니다.");
        }
      } else if (maskValue === "accountSecret") {
        valueToEncrypt = userSecretNum || localValue;

        if (!valueToEncrypt || valueToEncrypt.length !== 13) {
          throw new Error("주민등록번호 13자리를 입력해주세요.");
        }

        if (!validateResidentNumber(valueToEncrypt)) {
          throw new Error("유효하지 않은 주민등록번호입니다.");
        }
      } else {
        // 기본 처리 (계좌번호 등)
        valueToEncrypt = localValue;
      }

      // 암호화된 데이터 생성
      encryptedData = await createPostData(valueToEncrypt, publicKey);

      // 암호화된 데이터를 onClick 콜백 함수로 전달
      if (onClick) {
        onClick(encryptedData);
      }
    } catch (error) {
      setModalError(error.message || "암호화 실패");
      console.error("암호화 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    setModalError(null);
  };

  // CommonSecureKeyboard에 전달할 값들
  // minorChild는 그대로 전달하여 새로운 마스킹 로직 사용
  const keyboardMaskValue = maskValue;
  const keyboardMaxLength = maxLength;

  return (
    <div>
      <CommonSecureKeyboard
        value={localValue}
        onChange={(value) => {
          setLocalValue(value);
          if (onChange) {
            onChange(value);
          }
        }}
        placeholder={placeholder}
        maxLength={keyboardMaxLength}
        onConfirm={handleEncryption}
        maskValue={keyboardMaskValue}
      />
      {error && <p style={{ color: "#E86565" }}>{error}</p>}
      {loading && <Loading />}
      {/* ErrorModal */}
      {modalError && <ErrorModal message={modalError} onClose={closeModal} />}
    </div>
  );
};

export default SecureInputForm;
