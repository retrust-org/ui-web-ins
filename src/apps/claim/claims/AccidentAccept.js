import { useState, useEffect } from "react";
import CustomBorderInput from "../../../components/inputs/CustomBorderInput";
import OptionContainer from "../../../components/inputs/OptionContainr";
import SelectBankModal from "./SelectBankModal";
import styles from "../../../css/claim/claimAccidentAccept.module.css";
import SecureInputForm from "../../../components/inputs/SecureInputForm";
import RelationData from "../../../data/RelationData.json";
import { useNavigate } from "react-router-dom";
import ClaimButton from "../../../components/buttons/ClaimButton";
import ClaimHeader from "../components/ClaimHeader";
import { useClaimUploadContext } from "../../../context/ClaimUploadContext";

function AccidentAccept() {
  const navigate = useNavigate();

  // Context 사용 - 분리된 데이터 구조
  const { claimData, saveAcceptData, typeSelectedData, receiptType, userName } =
    useClaimUploadContext();

  // 각 Context에서 필요한 데이터 추출
  const selectedProduct = claimData?.product_name;
  const accidentDate = claimData?.accident_date;
  const contractId = claimData?.contract_id;

  // 디버깅 로그
  useEffect(() => {
    console.log("=== AccidentAccept에서 Context 데이터 확인 ===");
    console.log("claimData:", claimData);
    console.log("typeSelectedData:", typeSelectedData);
    console.log("receiptType:", receiptType);
    console.log("userName:", userName);
    console.log("선택된 상품:", selectedProduct);
    console.log("사고일자:", accidentDate);
    console.log("계약 ID:", contractId);
  }, [
    claimData,
    typeSelectedData,
    receiptType,
    userName,
    selectedProduct,
    accidentDate,
    contractId,
  ]);

  // 날짜 형식 변환 함수 (YYYYMMDD -> YYYY-MM-DD)
  const formatDate = (dateString) => {
    if (!dateString || dateString.length !== 8) return "";
    return `${dateString.substring(0, 4)}-${dateString.substring(
      4,
      6
    )}-${dateString.substring(6, 8)}`;
  };

  const maxLength = 1000;
  const [text, setText] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [error, setError] = useState({
    phoneNumber: "",
    accountNumber: "",
    accountHolderName: "",
    residentNumber: "",
  });
  const [inputTouched, setInputTouched] = useState({
    phoneNumber: false,
    accountNumber: false,
    accountHolderName: false,
    residentNumber: false,
  });

  // 계좌 정보 관련 상태 추가
  const [isSelectBankModalOpen, setIsSelectBankModalOpen] = useState(false);
  const [selectedBank, setSelectedBank] = useState("");
  const [selectedBankCd, setSelectedBankCd] = useState(""); // 은행 코드 상태 추가
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolderName, setAccountHolderName] = useState("");
  const [selectedRelation, setSelectedRelation] = useState("");
  const [selectedRelationKey, setSelectedRelationKey] = useState("");
  const [residentNumber, setResidentNumber] = useState("");
  const [toggleActive, setToggleActive] = useState(false);
  const [isButtonDisabled, setIsButtonDisabled] = useState(true); // 버튼 활성화 상태
  const [encryptedAccountNum, setEncryptedAccountNum] = useState({});
  const [encryptedSecretNum, setEncryptedSecretNum] = useState({});

  // 휴대폰 번호 파싱
  const [arCcoCd1, setArCcoCd1] = useState(""); // 앞자리
  const [telofNo1, setTelofNo1] = useState(""); // 중간자리
  const [telSno1, setTelSno1] = useState(""); // 뒷자리

  // 필수 입력값 유효성 검사
  useEffect(() => {
    // 필수 항목이 모두 입력되었는지 확인
    const isPhoneValid = phoneNumber && phoneNumber.length >= 10;
    const isBankSelected = selectedBank && selectedBankCd;
    const isAccountValid = accountNumber && accountNumber.length >= 10;
    const isNameValid = accountHolderName && accountHolderName.length >= 2;

    // 관계가 본인이 아닌 경우 주민번호도 필요
    const isRelationshipValid =
      selectedRelation === "본인" ||
      (selectedRelation && residentNumber && residentNumber.length === 13);

    // 버튼 활성화 상태 업데이트
    setIsButtonDisabled(
      !(
        isPhoneValid &&
        isBankSelected &&
        isAccountValid &&
        isNameValid &&
        isRelationshipValid
      )
    );
  }, [
    phoneNumber,
    selectedBank,
    selectedBankCd,
    accountNumber,
    accountHolderName,
    selectedRelation,
    residentNumber,
  ]);

  // 휴대폰 번호 파싱 함수
  useEffect(() => {
    if (phoneNumber && phoneNumber.length >= 10) {
      // 휴대폰 번호 파싱 (010-1234-5678 형식)
      setArCcoCd1(phoneNumber.substring(0, 3)); // 010

      // 중간자리와 뒷자리의 길이가 다를 수 있으므로 유연하게 처리
      if (phoneNumber.length === 10) {
        // 01012345678 (10자리)
        setTelofNo1(phoneNumber.substring(3, 6)); // 123
        setTelSno1(phoneNumber.substring(6)); // 4567
      } else if (phoneNumber.length === 11) {
        // 010-1234-5678 (11자리)
        setTelofNo1(phoneNumber.substring(3, 7)); // 1234
        setTelSno1(phoneNumber.substring(7)); // 5678
      }
    }
  }, [phoneNumber]);

  const nextBtn = () => {
    // Context에 데이터 저장 - 새로운 구조에 맞게
    const acceptDataToSave = {
      text: text, // 사고원인 및 청구내용
      arCcoCd1: arCcoCd1, // 휴대폰 앞자리
      telofNo1: telofNo1, // 휴대폰 중간자리
      telSno1: telSno1, // 휴대폰 뒷자리

      // 계좌 정보
      selectedBank: selectedBank, // 은행명
      selectedBankCd: selectedBankCd, // 은행코드
      accountHolderName: accountHolderName, // 예금주

      // 암호화된 데이터
      accountEncryptedKey: encryptedAccountNum.encryptedKey || "",
      accountIv: encryptedAccountNum.iv || "",
      accountEncryptedData: encryptedAccountNum.encryptedData || "",

      // 관계
      relationCd: selectedRelationKey, // 관계코드
      relation: selectedRelation, // 관계명

      // 예금주 주민번호 (관계가 본인이 아닌 경우)
      depositorEncryptedKey: encryptedSecretNum.encryptedKey || null,
      depositorIv: encryptedSecretNum.iv || null,
      depositorEncryptedData: encryptedSecretNum.encryptedData || null,

      // 기타 정보
      receiptType: receiptType,
      userName: userName,
    };

    console.log("=== AccidentAccept에서 저장할 데이터 ===");
    console.log(acceptDataToSave);

    saveAcceptData(acceptDataToSave);

    // 다음 페이지로 이동
    navigate("/claimDocuments");
  };

  // textarea 변경 이벤트 핸들러 추가
  const handleChange = (e) => {
    // 최대 글자 수 제한
    if (e.target.value.length <= maxLength) {
      setText(e.target.value);
    }
  };

  // 전화번호 입력 처리 함수
  const handlePhoneNumberChange = (value) => {
    // 숫자만 입력 가능하도록 처리
    const numericValue = value.replace(/[^0-9]/g, "");

    // 전화번호 형식에 맞게 하이픈 자동 추가 (선택적)
    let formattedValue = numericValue;
    if (numericValue.length > 3 && numericValue.length <= 7) {
      formattedValue = numericValue.replace(/(\d{3})(\d+)/, "$1$2");
    } else if (numericValue.length > 7) {
      formattedValue = numericValue.replace(/(\d{3})(\d{4})(\d+)/, "$1$2$3");
    }

    setPhoneNumber(formattedValue);

    // 전화번호 유효성 검사
    if (formattedValue.length < 10) {
      setError({ ...error, phoneNumber: "올바른 휴대폰 번호를 입력해주세요." });
    } else {
      setError({ ...error, phoneNumber: "" });
    }

    setInputTouched({ ...inputTouched, phoneNumber: true });
  };

  // 은행 선택 모달 관련 함수
  const openBankModal = () => {
    setIsSelectBankModalOpen(true);
  };

  const closeBankModal = () => {
    setIsSelectBankModalOpen(false);
  };

  // 은행 선택 처리 함수 - 은행명과 은행코드 모두 받음
  const handleBankSelect = (bankName, bankCd) => {
    setSelectedBank(bankName);
    setSelectedBankCd(bankCd); // 은행 코드 저장
    closeBankModal();
  };

  // 입력 필드 변경 핸들러
  const handleInputChange = (field, value, validator) => {
    switch (field) {
      case "accountNumber":
        setAccountNumber(value);
        if (value.length < 10) {
          setError({
            ...error,
            accountNumber: "올바른 계좌번호를 입력해주세요.",
          });
        } else {
          setError({ ...error, accountNumber: "" });
        }
        break;
      case "accountHolderName":
        setAccountHolderName(value);
        if (validator && !validator(value)) {
          setError({
            ...error,
            accountHolderName: "올바른 예금주 이름을 입력해주세요.",
          });
        } else {
          setError({ ...error, accountHolderName: "" });
        }
        break;
      case "residentNumber":
        setResidentNumber(value);
        if (value.length !== 13) {
          setError({
            ...error,
            residentNumber: "주민등록번호 13자리를 입력해주세요.",
          });
        } else {
          setError({ ...error, residentNumber: "" });
        }
        break;
      default:
        break;
    }

    setInputTouched({ ...inputTouched, [field]: true });
  };

  // 관계 선택 핸들러
  const handleRelationSelect = (value, key) => {
    setSelectedRelation(value);
    setSelectedRelationKey(key);
    setToggleActive(false);
  };

  // 암호화된 계좌번호 처리 - 객체로 저장
  const handleEncryptedAccountNumber = (encryptedData) => {
    setEncryptedAccountNum(encryptedData);
  };

  // 암호화된 주민번호 처리 - 객체로 저장
  const EncryptedAccountSecretNum = (encryptedData) => {
    setEncryptedSecretNum(encryptedData);
  };

  // 예금주 이름 유효성 검사
  const validateAccountHolderName = (name) => {
    return name.length >= 2; // 예시: 이름이 2글자 이상
  };

  // 에러 메시지 표시 여부 결정 함수
  const shouldShowError = (fieldName) => {
    return inputTouched[fieldName] && error[fieldName];
  };

  // 필수 데이터 검증
  if (!selectedProduct || !accidentDate || !contractId) {
    return (
      <div className={styles.acceptSection}>
        <ClaimHeader titleText="청구하기" />
        <div className={styles.sectionWrap}>
          <h2>이전 단계를 완료해주세요</h2>
          <ClaimButton
            buttonText="이전으로"
            onClick={() => navigate("/claimSelectDate")}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.acceptSection}>
      <ClaimHeader titleText="청구하기" />
      <div className={styles.sectionWrap}>
        <h2>사고를 접수해주세요</h2>
        <div className={styles.acceptSection_Title}>
          <span>1</span>
          <p>사고 정보 입력</p>
        </div>
        <div className={styles.accidentDate}>
          <p>사고일자</p>
          {/* Context에서 가져온 날짜 표시 */}
          <CustomBorderInput value={formatDate(accidentDate || "")} readOnly />
        </div>
        <div className={styles.textArea}>
          <div className={styles.accidentDetails}>
            <p>사고원인 및 청구내용</p>
            <div className={styles.textAreaWrap}>
              <textarea
                spellCheck="false"
                className={styles.customTextarea}
                value={text}
                onChange={handleChange}
                placeholder="최대 1000자까지 입력할 수 있습니다."
              />
              <div className={styles.textCount}>
                <div className={styles.currentCount}>{text.length}</div>
                <div className={styles.slash}>/</div>
                <div className={styles.quotientCount}>{maxLength}</div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.acceptSection_Title}>
          <span>2</span>
          <p>계좌 정보 입력</p>
        </div>
        <div className={styles.contentForm}>
          <div className={styles.inputWrap}>
            <label className={styles.styledLabel}>
              휴대폰 번호(처리과정 안내문자 수신)
            </label>
            <div className={styles.custominput}>
              <CustomBorderInput
                placeholder="'-'빼고 입력해주세요."
                type="tel"
                maxLength={13}
                value={phoneNumber}
                onChange={(value) => {
                  handlePhoneNumberChange(value);
                }}
                onClear={() => {
                  setPhoneNumber("");
                  setError({ ...error, phoneNumber: "" });
                  setInputTouched({
                    ...inputTouched,
                    phoneNumber: false,
                  });
                }}
                error={shouldShowError("phoneNumber")}
              />
            </div>
          </div>

          {/* 보험금 입금계좌 섹션 */}
          <div className={styles.escrowContentsWrap}>
            <div className={styles.escrowContents}>
              <div className={styles.escrowContents_span}>보험금 입금계좌</div>
              <div className={styles.accountList}>
                <div className={styles.selectBankInput} onClick={openBankModal}>
                  <CustomBorderInput
                    placeholder="금융기관을 선택해주세요."
                    readOnly
                    value={selectedBank}
                  />
                </div>
                {isSelectBankModalOpen && (
                  <SelectBankModal
                    isOpen={isSelectBankModalOpen}
                    onClose={closeBankModal}
                    onSelectBank={handleBankSelect}
                  />
                )}
                <SecureInputForm
                  initialValue={accountNumber}
                  placeholder="계좌번호를 입력해주세요."
                  maxLength={13}
                  error={shouldShowError("accountNumber")}
                  onChange={(value) =>
                    handleInputChange("accountNumber", value)
                  }
                  onClick={(encryptedData) => {
                    handleEncryptedAccountNumber(encryptedData);
                  }}
                  maskValue="account"
                  userSecretNum={accountNumber}
                />

                <CustomBorderInput
                  placeholder="예금주 이름을 입력해주세요."
                  value={accountHolderName}
                  onChange={(value) =>
                    handleInputChange(
                      "accountHolderName",
                      value,
                      validateAccountHolderName
                    )
                  }
                  onClear={() => {
                    setAccountHolderName("");
                    setError({ ...error, accountHolderName: "" });
                    setInputTouched({
                      ...inputTouched,
                      accountHolderName: false,
                    });
                  }}
                  error={shouldShowError("accountHolderName")}
                />

                <div className={styles.relationshipContents}>
                  <OptionContainer
                    title="관계 선택"
                    items={Object.values(RelationData)}
                    onChange={(isActive) => setToggleActive(isActive)}
                    onItemSelect={(selectedItem) => {
                      // selectedItem은 value값이므로 key를 찾기 위한 로직
                      const foundKey =
                        Object.entries(RelationData).find(
                          ([k, v]) => v === selectedItem
                        )?.[0] || "";
                      handleRelationSelect(selectedItem, foundKey);
                    }}
                  />
                </div>
              </div>
              {selectedRelation !== "본인" && selectedRelation !== "" && (
                <>
                  <SecureInputForm
                    placeholder="예금주 주민등록번호 13자리를 입력해주세요."
                    maxLength={13}
                    value={residentNumber}
                    onChange={(value) =>
                      handleInputChange("residentNumber", value)
                    }
                    onClick={(encryptedData) => {
                      EncryptedAccountSecretNum(encryptedData);
                    }}
                    maskValue="accountSecret"
                    userSecretNum={residentNumber}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </div>
      <ClaimButton
        buttonText="다음"
        onClick={nextBtn}
        disabled={isButtonDisabled}
      />
    </div>
  );
}

export default AccidentAccept;
