import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import ClaimHeader from "../../claim/components/ClaimHeader";
import { setBirthSecondPart, setMrzUser } from "../../../redux/store";
import SecureKeyboard from "../../../components/secureKeyboards/SecureKeyboard";
import SuccessModal from "../../../components/modals/SuccessModal";
import ErrorModal from "../../../components/modals/ErrorModal";
import CreatePostData from "../../../data/CreatePostData";
import usePublicKey from "../../../data/PublicGetApi";
import styles from "../../../css/claim/claimCombine.module.css";
import CustomInput from "../../../components/inputs/CustomInput";
import Loading from "../../../components/loadings/Loading";
import ClaimButton from "../../../components/buttons/ClaimButton";

function ClaimCombine() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const targetRoute = location.state?.targetRoute || "/";
  const redirectPath = queryParams.get("redirect") || targetRoute;
  const [error, setError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState("");
  const [plainValue, setPlainValue] = useState(""); // 주민등록번호 뒷자리
  const publicKey = usePublicKey();
  const [value, setValue] = useState(""); // SecureKeyboard로부터 전달받을 값
  const token = useSelector((state) => state.cookie.cookie);
  const userBirth = token?.birth || ""; // birth 값 추가 파싱 수정
  const userName = token?.name || ""; // birth 값 추가 파싱 수정
  const sliceUserBirth = userBirth.slice(2); // yymmdd 형태로 변경
  const [results, setResults] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const mrzUser = useSelector((state) => state.cookie.mrzUser);

  useEffect(() => {
    // mrzUser가 있고 targetRoute가 /emergencySupport인 경우 직접 이동
    if (mrzUser && targetRoute === "/emergencySupport") {
      navigate("/emergencySupport");
    }
  }, [mrzUser, targetRoute, navigate]);

  // API 호출 함수
  const callApi = async (encryptedData) => {
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: JSON.stringify(encryptedData),
      redirect: "follow",
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/trip-api/auth/regist`,
        requestOptions
      );
      if (!response.ok) {
        throw new Error("API 호출 실패");
      }
      const result = await response.json();
      setResults(result);

      if (result.errCd === "00001") {
        dispatch(setMrzUser(result.mrzUser));
        handleSuccess(result.message);
      } else {
        handleError(result.message);
      }
    } catch (error) {
      // 에러 로깅
      console.error("통합인증 API 실패:", error, {
        endpoint: "/trip-api/auth/regist"
      });

      handleError("API 호출에 실패했습니다.");
    }
  };

  // 주민등록번호 유효성 검사 함수
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

  // 성공 처리 함수
  const handleSuccess = (message) => {
    setShowSuccessModal(true);
    setModalMessage(`통합인증이`);
  };

  // 실패 처리 함수
  const handleError = (message) => {
    setShowErrorModal(true);
    setModalMessage(message);
  };

  // 폼 제출 처리 및 API 호출
  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const residentNumber = sliceUserBirth + plainValue;
      if (!validateResidentNumber(residentNumber)) {
        setError("유효하지 않은 주민번호입니다.");
        return;
      }
      const fullResidentNumber = sliceUserBirth + plainValue;
      const encryptedData = await CreatePostData(fullResidentNumber, publicKey);
      dispatch(setBirthSecondPart(encryptedData)); // 암호화된 데이터를 Redux 상태에 저장
      await callApi(encryptedData); // API 호출
    } catch (error) {
      // 에러 로깅
      console.error("통합인증 암호화 실패:", error, {
        hasPublicKey: !!publicKey
      });

      setError("데이터 암호화 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 성공 모달 닫기 후 처리
  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    if (targetRoute === "/emergencySupport") {
      navigate("/emergencySupport");
    } else {
      navigate(redirectPath || "/");
    }
  };

  // 실패 모달 닫기 후 처리
  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    navigate("/", { state: { results } });
  };

  return (
    <>
      <ClaimHeader titleText="통합인증" />
      <div className={styles.Contents}>
        <div className={styles.inputWrap}>
          <div className={styles.styledLabel}>
            <h1>
              가입자 또는 피보험자 정보를 <br />
              입력해주세요.
            </h1>
            <p>미성년자는 가입자 정보를 입력해주세요.</p>
          </div>
          <div className={styles.inputContentsFlexCol}>
            <label>이름</label>
            <CustomInput readOnly value={userName} />
          </div>
          <div className={styles.inputContentsFlexCol}>
            <label>주민등록번호</label>
            <div className={styles.inputFlexRow}>
              <div className={styles.identifyNum}>
                <CustomInput value={sliceUserBirth} readOnly />
              </div>
              <span>-</span>
              <div className={styles.identifyNum}>
                <SecureKeyboard
                  onChange={setPlainValue}
                  setValue={setValue}
                  value={value}
                />
                {error && <p className={styles.errorMsg}>{error}</p>}
              </div>
            </div>
          </div>
          <ClaimButton buttonText="통합인증" onClick={handleSubmit} />
        </div>
      </div>
      {isLoading && <Loading />}
      {/* 성공 모달 */}
      {showSuccessModal && (
        <SuccessModal
          message={modalMessage}
          onClose={handleCloseSuccessModal}
        />
      )}
      {/* 실패 모달 */}
      {showErrorModal && (
        <ErrorModal message={modalMessage} onClose={handleCloseErrorModal} />
      )}
    </>
  );
}

export default ClaimCombine;
