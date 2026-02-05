import React, { useState, useEffect } from "react";
import styles from "../../../css/claim/claimInsuredpeopleInfo.module.css";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import SecureInputForm from "../../../components/inputs/SecureInputForm";
import { formatKoreanDate } from "../../../utils/birthDate";
import ClaimButton from "../../../components/buttons/ClaimButton";
import ClaimHeader from "../components/ClaimHeader";
import { useClaimUploadContext } from "../../../context/ClaimUploadContext";
import ErrorModal from "../../../components/modals/ErrorModal";
import SuccessModal from "../../../components/modals/SuccessModal";
import Loading from "../../../components/loadings/Loading";
import CustomBorderInput from "../../../components/inputs/CustomBorderInput";

function InsuredpeopleInfo() {
  const navigate = useNavigate();

  const {
    receiptType,
    saveAllContractData,
    saveInsuredData,
    saveReceiptTypeAndUserName,
    userName: contextUserName,
  } = useClaimUploadContext();

  const token = useSelector((state) => state.cookie.cookie);
  const userBirth = token?.birth || "";
  const tokenUserName = token?.name || "";

  // 공통 상태들
  const [isButtonDisabled, setIsButtonDisabled] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  // 본인 청구용 상태들
  const [rrnValue, setRrnValue] = useState("");
  const [error, setError] = useState("");
  const [encryptedRRN, setEncryptedRRN] = useState("");

  // 미성년 자녀 청구용 상태들
  const [minorChildName, setMinorChildName] = useState("");
  const [minorChildRRN, setMinorChildRRN] = useState("");
  const [minorChildEncryptedRRN, setMinorChildEncryptedRRN] = useState("");

  // receiptType으로 구분하는 헬퍼 함수들
  const isSelfClaim = () => receiptType === "self";
  const isMinorChildClaim = () => receiptType === "minorChild";

  // 통합된 현재 사용자명 가져오기
  const getCurrentUserName = () => {
    if (isSelfClaim()) {
      return tokenUserName; // 본인 청구시 토큰의 이름 사용
    } else if (isMinorChildClaim()) {
      return minorChildName || contextUserName || ""; // 미성년 자녀 청구시 입력받은 이름 우선 사용
    }
    return "";
  };

  // 컴포넌트 마운트 시 접수 유형에 따른 초기화
  useEffect(() => {
    console.log("=== InsuredpeopleInfo 초기화 ===");
    console.log("receiptType:", receiptType);
    console.log("contextUserName:", contextUserName);
    console.log("tokenUserName:", tokenUserName);

    if (receiptType) {
      if (isSelfClaim()) {
        // 본인 청구의 경우
        if (!contextUserName || contextUserName !== tokenUserName) {
          console.log("본인청구 - 토큰 이름으로 업데이트");
          saveReceiptTypeAndUserName(receiptType, tokenUserName);
        }
        // 이전에 미성년 자녀 이름이 입력되어 있었다면 초기화
        setMinorChildName("");
        setMinorChildRRN("");
        setMinorChildEncryptedRRN("");
      } else if (isMinorChildClaim()) {
        // 미성년 자녀 청구의 경우
        if (contextUserName && contextUserName !== tokenUserName) {
          // Context에 저장된 자녀 이름이 있고, 토큰 이름과 다르면 복원
          console.log(
            "미성년 자녀 청구 - 저장된 자녀 이름 복원:",
            contextUserName
          );
          setMinorChildName(contextUserName);
        } else {
          // 새로 시작하는 경우 초기화
          console.log("미성년 자녀 청구 - 새로 시작, 초기화");
          setMinorChildName("");
          setMinorChildRRN("");
          setMinorChildEncryptedRRN("");
        }
        // 본인 청구 관련 상태 초기화
        setRrnValue("");
        setEncryptedRRN("");
      }
    }
  }, [receiptType, tokenUserName, contextUserName, saveReceiptTypeAndUserName]);

  // 버튼 활성화 조건 업데이트
  useEffect(() => {
    if (isMinorChildClaim()) {
      const isNameValid = minorChildName.trim().length >= 2;
      const isRRNValid = minorChildRRN.length === 13;
      const hasEncryptedData =
        minorChildEncryptedRRN && minorChildEncryptedRRN.encryptedData;

      setIsButtonDisabled(!(isNameValid && isRRNValid && hasEncryptedData));
    } else {
      setIsButtonDisabled(!(encryptedRRN && encryptedRRN.encryptedData));
    }
  }, [
    minorChildName,
    minorChildRRN,
    minorChildEncryptedRRN,
    encryptedRRN,
    receiptType,
  ]);

  // 본인 청구용 핸들러들
  const handleEncryptedRRN = (encryptedData) => {
    setEncryptedRRN(encryptedData);

    // 본인청구일 때만 insuredData를 Context에 저장
    if (isSelfClaim() && encryptedData && encryptedData.encryptedData) {
      const insuredDataToSave = {
        personName: getCurrentUserName(), // 통합된 이름 사용
        encryptedRRN: {
          encryptedKey: encryptedData.encryptedKey,
          iv: encryptedData.iv,
          encryptedData: encryptedData.encryptedData,
        },
      };

      console.log("=== 본인청구 insuredData 저장 ===");
      console.log(insuredDataToSave);

      saveInsuredData(insuredDataToSave);
    }
  };

  const handleRRNChange = (value) => {
    setRrnValue(value);
    setError("");
  };

  // 미성년 자녀 청구용 핸들러들
  const handleMinorChildNameChange = (value) => {
    setMinorChildName(value);

    // 자녀 이름이 유효할 때 Context에 사용자명 저장
    if (value.trim().length >= 2 && isMinorChildClaim()) {
      saveReceiptTypeAndUserName(receiptType, value.trim());
    } else if (isMinorChildClaim()) {
      // 이름이 유효하지 않을 때는 null로 설정
      saveReceiptTypeAndUserName(receiptType, null);
    }
  };

  const handleMinorChildNameClear = () => {
    setMinorChildName("");
    // 이름을 지울 때 Context에서도 사용자명 제거
    if (isMinorChildClaim()) {
      saveReceiptTypeAndUserName(receiptType, null);
    }
  };

  const handleMinorChildRRNChange = (value) => {
    const numericValue = value.replace(/[^0-9]/g, "");
    setMinorChildRRN(numericValue);
  };

  const handleMinorChildEncryptedRRN = (encryptedData) => {
    setMinorChildEncryptedRRN(encryptedData);
    console.log("미성년 자녀 암호화 데이터:", encryptedData);

    // 미성년 자녀 청구일 때 insuredData를 Context에 저장
    if (isMinorChildClaim() && encryptedData && encryptedData.encryptedData) {
      const insuredDataToSave = {
        personName: getCurrentUserName(), // 통합된 이름 사용
        encryptedRRN: {
          encryptedKey: encryptedData.encryptedKey,
          iv: encryptedData.iv,
          encryptedData: encryptedData.encryptedData,
        },
      };

      console.log("=== 미성년 자녀 청구 insuredData 저장 ===");
      console.log(insuredDataToSave);

      saveInsuredData(insuredDataToSave);
    }
  };

  // contracts API 호출
  const callContractsApi = async () => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const currentUserName = getCurrentUserName();
    let requestBody;

    if (isMinorChildClaim()) {
      // 미성년 자녀 청구: 입력받은 자녀 이름 사용
      requestBody = JSON.stringify({
        encryptedData: minorChildEncryptedRRN.encryptedData,
        encryptedKey: minorChildEncryptedRRN.encryptedKey,
        iv: minorChildEncryptedRRN.iv,
        user_name: currentUserName,
      });
    } else {
      // 본인 청구: 토큰의 username 사용
      requestBody = JSON.stringify({
        encryptedData: encryptedRRN.encryptedData,
        encryptedKey: encryptedRRN.encryptedKey,
        iv: encryptedRRN.iv,
        user_name: currentUserName,
      });
    }

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/trip-api/api/v1/trip/auth/regist/allContracts`,
        { method: "POST", headers: myHeaders, body: requestBody }
      );
      const result = await response.json();

      if (result.errCd === "00001" && result.mrzUser === true) {
        // 성공 시 Context에 allContract 결과값 저장
        saveAllContractData(result.claimableContracts);

        return true;
      } else {
        setErrorMessage(
          result.mrzUser === false
            ? "메리츠 회원이 아닙니다. 회원가입 후 이용해주세요."
            : "청구정보를 확인해주세요."
        );
        setIsModalOpen(true);
        return false;
      }
    } catch (error) {
      console.error("Contracts API 오류:", error);
      setErrorMessage("네트워크 연결을 확인해주세요.");
      setIsModalOpen(true);
      return false;
    }
  };

  // 확인 버튼 클릭 핸들러
  const handleConfirmClick = async () => {
    try {
      setIsButtonDisabled(true);
      setIsLoading(true);

      const hasRequiredData = isMinorChildClaim()
        ? minorChildEncryptedRRN?.encryptedData
        : encryptedRRN?.encryptedData;

      if (!hasRequiredData) {
        setErrorMessage("주민등록번호를 입력해주세요.");
        setIsModalOpen(true);
        return;
      }

      // 현재 사용자명 검증
      const currentUserName = getCurrentUserName();
      if (!currentUserName || currentUserName.trim().length < 2) {
        setErrorMessage("올바른 이름을 입력해주세요.");
        setIsModalOpen(true);
        return;
      }

      const contractsSuccess = await callContractsApi();

      if (contractsSuccess) {
        setIsSuccessModalOpen(true);
      }
    } catch (error) {
      console.error("API 호출 중 오류:", error);
      setErrorMessage("오류가 발생했습니다.");
      setIsModalOpen(true);
    } finally {
      setIsLoading(false);
      setIsButtonDisabled(false);
    }
  };

  const closeErrorModal = () => setIsModalOpen(false);

  const closeSuccessModal = () => {
    setIsSuccessModalOpen(false);
    navigate("/claimAgree"); // 다음 페이지로 이동
  };

  // 접수 유형이 설정되지 않은 경우 처리
  if (!receiptType) {
    return (
      <div className={styles.claimContainer}>
        <ClaimHeader titleText="청구하기" />
        <div className={styles.section_1}>
          <h1>접수 유형을 먼저 선택해주세요.</h1>
          <div className={styles.buttonContainer}>
            <ClaimButton buttonText="이전으로" onClick={() => navigate(-1)} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.claimContainer}>
      <ClaimHeader titleText="청구하기" />
      {isLoading && <Loading />}
      <div className={styles.section_1}>
        <h1>피보험자 정보를 입력해주세요.</h1>

        {isSelfClaim() ? (
          // 본인청구 UI
          <div className={styles.sectionContentsWrap}>
            <div className={styles.sectionContentsWrap_userSelect}>
              {/* 사용자 정보 표시 */}
              <div className={styles.userInfoDisplay}>
                <div className={styles.selectedOption}>
                  <p>{getCurrentUserName()}</p>
                  <p>{formatKoreanDate(userBirth)}</p>
                </div>
              </div>
              <div className={styles.secureInputContainer}>
                <SecureInputForm
                  initialValue={rrnValue}
                  placeholder="주민등록번호 뒷자리를 입력해주세요."
                  error={error}
                  selectedBirth={userBirth}
                  onChange={handleRRNChange}
                  maskValue="secret"
                  onClick={handleEncryptedRRN}
                />
              </div>
            </div>
          </div>
        ) : (
          // 미성년 자녀 청구 UI
          <div className={styles.sectionContentsWrap}>
            <div className={styles.sectionContentsWrap_userSelect}>
              <div style={{ marginBottom: "16px" }}>
                <CustomBorderInput
                  placeholder="자녀 이름을 입력해주세요"
                  value={minorChildName}
                  onChange={handleMinorChildNameChange}
                  onClear={handleMinorChildNameClear}
                  maxLength={50}
                />
              </div>
              <div>
                <SecureInputForm
                  placeholder="자녀 주민등록번호 13자리를 입력해주세요"
                  onChange={handleMinorChildRRNChange}
                  maskValue="minorChild"
                  onClick={handleMinorChildEncryptedRRN}
                  maxLength={13}
                  userSecretNum={minorChildRRN}
                />
              </div>
            </div>
          </div>
        )}

        <div className={styles.buttonContainer}>
          <ClaimButton
            buttonText="다음"
            disabled={isButtonDisabled}
            onClick={handleConfirmClick}
          />
        </div>
      </div>
      {isModalOpen && (
        <ErrorModal message={errorMessage} onClose={closeErrorModal} />
      )}
      {isSuccessModalOpen && (
        <SuccessModal message="청구정보 등록이" onClose={closeSuccessModal} />
      )}
    </div>
  );
}

export default InsuredpeopleInfo;
