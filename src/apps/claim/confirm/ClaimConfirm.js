import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import styles from "../../../css/claim/claimConfirm.module.css";
import commonDownArrow from "../../../assets/commonDownArrow.svg";
import claimConfirmWound from "../../../assets/claimConfirmWound.svg";
import commonUpArrow from "../../../assets/commonUpArrow.svg";
import commonRightBig from "../../../assets/commonRightBig.svg";
import ConfirmTable from "./ConfirmTable";
import Loading from "../../../components/loadings/Loading";
import SecureKeyboard from "../../../components/secureKeyboards/SecureKeyboard";
import CreatePostData from "../../../data/CreatePostData";
import usePublicKey from "../../../data/PublicGetApi";
import ClaimUtilsApi from "../../../data/ClaimUtilsApi";
import ClaimSubHeaders from "../components/ClaimSubHeaders";
import ClaimConfirmGuide from "./ClaimConfirmGuide";
import ErrorModal from "../../../components/modals/ErrorModal";

const ClaimConfirm = () => {
  const [isOpenIndex, setIsOpenIndex] = useState([]);
  const [data, setData] = useState(null);
  const [encryptIdNum, setEncryptIdNum] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [secretValue, setSecretValue] = useState("");
  const [error, setError] = useState("");
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isValidated, setIsValidated] = useState(false); // 검증 완료 상태 추가

  const publicKey = usePublicKey();
  const token = useSelector((state) => state.cookie.cookie);
  const userBirth = token?.birth || "";
  const sliceUserBirth = userBirth.slice(2); // 생년월일 뒷 6자리 (951227)

  const claimDetails = [
    { label: "사고번호", key: "acdNo" },
    { label: "사고일자", key: "acdDt", isDate: true },
    { label: "피보험자", key: "inspePolhdNm" },
  ];

  ClaimUtilsApi();

  // 에러 모달 닫기 및 홈으로 리디렉션 처리 함수
  const handleCloseErrorModal = () => {
    setShowErrorModal(false);
    window.location.href = "/";
  };

  // SecureKeyboard에서 값이 변경될 때 호출되는 함수
  const handleSecretValueChange = (value) => {
    setSecretValue(value);

    // 7자리가 입력되면 바로 검증 완료로 처리 (실제 검증은 서버에서)
    if (value.length === 7) {
      setIsValidated(true);
      setError("");
    } else {
      setIsValidated(false);
      setError("");
    }
  };

  useEffect(() => {
    const fetchClaimList = async (encryptedData) => {
      try {
        setIsLoading(true);

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({
          encryptedData: encryptedData.encryptedData,
          encryptedKey: encryptedData.encryptedKey,
          iv: encryptedData.iv,
        });

        const requestOptions = {
          method: "POST",
          headers: myHeaders,
          body: raw,
          redirect: "follow",
        };

        const response = await fetch(
          `${process.env.REACT_APP_BASE_URL}/trip-api/claimlist`,
          requestOptions
        );

        const result = await response.json();

        if (result.errCd !== "00001") {
          // 서버에서 명시적으로 에러를 반환한 경우
          const serverError = new Error("청구현황 조회 서버 에러");
          console.error("서버 에러:", {
            serverErrorCode: result.errCd,
            serverErrorMessage: result.errMsg,
            serverResponse: result,
          });

          setErrorMessage(result.errMsg || "청구현황 사항이 없습니다.");
          setShowErrorModal(true);
        } else if (!response.ok) {
          // 네트워크 응답 에러 (HTTP 상태 코드 오류)
          const networkError = new Error(
            `청구현황 API 네트워크 오류: ${response.statusText}`
          );
          console.error("네트워크 에러:", {
            endpoint: "/trip-api/claimlist",
            responseStatus: response.status,
            responseStatusText: response.statusText,
          });

          setErrorMessage("네트워크 서버가 불안정 합니다.");
          setShowErrorModal(true);
        } else if (
          result.errCd === "00001" &&
          result.comsPcsInqRslMSGBcVo &&
          result.comsPcsInqRslMSGBcVo.length === 0
        ) {
          // 정상 응답이지만 데이터가 없는 경우 (에러로 처리하지 않음)
          setErrorMessage("청구현황 사항이 없습니다.");
          setShowErrorModal(true);
        } else {
          setEncryptIdNum(raw);
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching data:", error);

        // 예상치 못한 오류
        console.error("청구현황 확인 오류:", {
          errorMessage: error.message,
          endpoint: "/trip-api/claimlist",
          hasEncryptedData: !!encryptedData,
        });

        setErrorMessage("오류가 발생하였습니다.");
        setShowErrorModal(true);
      } finally {
        setIsLoading(false);
      }
    };

    // 검증이 완료되고 secretValue와 publicKey가 있을 때만 API 호출
    if (isValidated && secretValue && publicKey) {
      const encryptData = async () => {
        try {
          const fullSecretValue = sliceUserBirth + secretValue;
          const encryptedData = await CreatePostData(
            fullSecretValue,
            publicKey
          );

          await fetchClaimList(encryptedData);
        } catch (error) {
          // 암호화 처리 오류
          console.error("암호화 오류:", {
            hasSecretValue: !!secretValue,
            hasPublicKey: !!publicKey,
            secretValueLength: secretValue.length,
          });

          setError("암호화 처리 중 오류가 발생하였습니다.");
          setIsLoading(false);
        }
      };

      encryptData();
    }
  }, [isValidated, secretValue, publicKey, sliceUserBirth]);

  const getBackgroundColor = (progStatNm) => {
    switch (progStatNm) {
      case "청구서류미접수":
        return "#E4BD26";
      case "접수":
        return "#55BAD1";
      case "종결":
        return "#B8B9BC";
      default:
        return "transparent";
    }
  };

  const formatDate = (date) => {
    if (!date || date.length !== 8) return date;
    const year = date.slice(0, 4);
    const month = date.slice(4, 6);
    const day = date.slice(6, 8);
    return `${year}년 ${month}월 ${day}일`;
  };

  const activeAccordion = (index) => {
    setIsOpenIndex((prevIndexState) => {
      const newState = [...prevIndexState];
      newState[index] = !newState[index];
      return newState;
    });
  };

  return (
    <>
      <ClaimSubHeaders titleText="청구현황 확인" />
      <div className={styles.section}>
        <div className={styles.sectionWrap}>
          <div
            className={`${styles.apiContents} ${
              !isValidated ? styles.apiContentsWithMargin : ""
            }`}
          >
            {!isValidated ? (
              <div className={styles.apiContentsFlexCol}>
                <ul>
                  <li>청구현황 확인을 위해</li>
                  <li>
                    <p className={styles.highlight}>주민등록번호 뒷자리</p>
                    <p className={styles.text}>를</p>
                  </li>
                  <li> 입력해주세요.</li>
                </ul>
                <p className={styles.desc}>
                  🧳입력하신 정보는 사용 후 저장하지 않습니다
                  <br />
                </p>
                <SecureKeyboard onChange={handleSecretValueChange} />
                {error && <div className={styles.errorMessage}>{error}</div>}
              </div>
            ) : (
              <>
                {isLoading ? (
                  <Loading />
                ) : (
                  <div className={styles.dataContents}>
                    {data &&
                      data.comsPcsInqRslMSGBcVo &&
                      data.comsPcsInqRslMSGBcVo.map((item, index) => {
                        const clmId = item ? item.clmId : undefined;
                        return (
                          <div className={styles.dataContentsWrap} key={index}>
                            <div className={styles.dataContentsTitle}>
                              <div className={styles.dataContentsTitleImage}>
                                <img
                                  src={claimConfirmWound}
                                  alt="claimConfirmWound"
                                />
                                <p>{item.clmTpNm}</p>
                              </div>
                              <span
                                style={{
                                  backgroundColor: getBackgroundColor(
                                    item.progStatNm
                                  ),
                                }}
                              >
                                {item.progStatNm}
                              </span>
                            </div>
                            <div className={styles.boundaryLine}></div>
                            <div className={styles.dataInformationWrap}>
                              <ul>
                                {claimDetails.map((detail, idx) => (
                                  <li key={idx}>
                                    <span>{detail.label}</span>
                                    <p>
                                      {detail.isDate
                                        ? formatDate(item[detail.key])
                                        : item[detail.key] || ""}
                                    </p>
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div className={styles.moreBtnWrap}>
                              <div onClick={() => activeAccordion(index)}>
                                {isOpenIndex[index] && (
                                  <div className={styles.accordionContent}>
                                    <div className={styles.acoordionTitle}>
                                      <p>지급내역</p>
                                      <div
                                        className={styles.acoordionTitleBtnWrap}
                                      >
                                        <button className="cursor-pointer">
                                          <Link
                                            to={`/claimPaymentStatement/${clmId}`}
                                            state={{ encryptIdNum }}
                                          >
                                            지급내역서 발급
                                          </Link>
                                        </button>
                                        <img
                                          src={commonRightBig}
                                          alt="RightBig"
                                        />
                                      </div>
                                    </div>
                                    <ConfirmTable />
                                  </div>
                                )}
                              </div>
                              {clmId && (
                                <div
                                  className={styles.moreBtn}
                                  onClick={() => activeAccordion(index)}
                                >
                                  <span>
                                    {isOpenIndex[index] ? "접기" : "더보기"}
                                  </span>
                                  <img
                                    src={
                                      isOpenIndex[index]
                                        ? commonUpArrow
                                        : commonDownArrow
                                    }
                                    alt={
                                      isOpenIndex[index]
                                        ? "upArrow"
                                        : "downArrow"
                                    }
                                  />
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
        {isValidated && !isLoading && !error && <ClaimConfirmGuide />}
      </div>

      {/* 에러 모달 컴포넌트 */}
      {showErrorModal && (
        <ErrorModal
          errorMessage={errorMessage}
          onClose={handleCloseErrorModal}
        />
      )}
    </>
  );
};

export default ClaimConfirm;
