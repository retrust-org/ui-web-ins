import React, { useState, useEffect } from "react";
import styles from "../../../css/claim/claimDocuments.module.css";
import UploadFileModal from "./UploadFileModal";
import ClaimDocumentsUpload from "./ClaimDocumentsUpload";
import ClaimDocAccordion from "./ClaimDocAccodian";
import ErrorModal from "../../../components/modals/ErrorModal";
import Loading from "../../../components/loadings/Loading";
import ClaimSucceedModal from "./ClaimSucceedModal";
import { useClaimUploadContext } from "../../../context/ClaimUploadContext";
import ClaimHeader from "../components/ClaimHeader";
import { useHomeNavigate } from "../../../hooks/useHomeNavigate";

function ClaimDocumentSend() {
  const { navigateToHome } = useHomeNavigate();

  // Context에서 모든 데이터 가져오기
  const { claimData, insuredData, typeSelectedData, acceptData } =
    useClaimUploadContext();

  // typeSelectedData에서 accidentCauseKey 값 사용 (키값)
  const propsAccient_cuase_cd = typeSelectedData.accidentCauseKey;

  // 일반 청구용 문서 카테고리 정의
  const claimDocCategories = [
    "보험금 청구서",
    "개인(신용)정보처리동의서",
    "위임장",
    "사고경위서",
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previews, setPreviews] = useState([[], [], [], []]); // 4개 카테고리로 변경
  const [isSucceedModalOpen, setIsSucceedModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [subErrorMessage, setSubErrorMessage] = useState("");
  const [imageName, setImageName] = useState([]); // 파일 이름 배열
  const [totalFiles, setTotalFiles] = useState(0);
  const [arrayResultData, setArrayResultData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // 파일 개수 계산
  useEffect(() => {
    // previews 배열의 모든 이미지 개수를 합산
    const fileCount = previews.reduce(
      (total, categoryFiles) => total + categoryFiles.length,
      0
    );
    setTotalFiles(fileCount);
  }, [previews]);

  const handleSendDocuments = async () => {
    if (totalFiles === 0) {
      alert("첨부된 파일이 없습니다. 필요서류를 먼저 첨부해주세요.");
      return;
    }
    setIsLoading(true);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    // 파일 목록이 비어있는지 확인
    if (!imageName || imageName.length === 0) {
      setErrorMessage("업로드된 파일 정보를 찾을 수 없습니다.");
      setSubErrorMessage("필요서류를 다시 첨부해주세요.");
      setIsErrorModalOpen(true);
      setIsLoading(false);
      return;
    }

    // 새로운 API 형식에 맞는 요청 데이터 생성
    const claimRequestData = {
      method: "claim",
      accident_cause_cd: typeSelectedData.accidentCauseKey || "", // 키값 사용 (예: "101")
      attachments: imageName, // 서버에서 받은 파일명 그대로 사용
    };

    const raw = JSON.stringify(claimRequestData);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/member-api/claimMRZ`,
        requestOptions
      );

      // 응답이 정상 상태 범위 내에 있으면 성공으로 처리
      if (response.ok) {
        // 성공 시 기본 응답 객체 생성
        const successResult = {
          result: "success",
          message: "보험금 청구 신청이 완료되었습니다.",
        };

        setArrayResultData(successResult);
        setIsSucceedModalOpen(true); // 성공 모달 열기
      } else {
        // 실패 시 기본 에러 메시지 설정
        setErrorMessage("서류 전송에 실패했습니다.");
        setSubErrorMessage(`상태 코드: ${response.status}`);
        setIsErrorModalOpen(true);
      }
    } catch (error) {
      console.error("오류 발생:", error);
      setErrorMessage(`서류 전송 중 오류가 발생했습니다: ${error.message}`);
      setIsErrorModalOpen(true);
    } finally {
      setIsLoading(false);
    }
  };

  // 모달 열기
  const openModal = () => {
    setIsModalOpen(true);
  };

  // 모달 닫기
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 파일 업로드 후 미리보기 이미지 업데이트
  const handleFileUpload = (newPreviews) => {
    setPreviews(newPreviews);
  };

  // 파일 이름 처리 핸들러
  const handleImageNameChange = (newImageNames) => {
    setImageName(newImageNames);
  };

  const closeSucceedModal = () => {
    setIsSucceedModalOpen(false);
    navigateToHome();
  };

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
  };

  // 모든 컨텍스트 데이터를 통합한 객체 생성
  const contextData = {
    ...claimData,
    ...insuredData,
    ...typeSelectedData,
    ...acceptData,
  };

  return (
    <>
      <ClaimHeader titleText="필요서류 전송" />
      <div className={styles.Contents}>
        <div className={styles.ContentsWrap}>
          <h3>
            보험금 청구에 <br /> 필요한 서류를 전송해주세요.
          </h3>
          {/* 아코디언 섹션 */}
          {/* <ClaimDocAccordion /> */}
        </div>
        <div className={styles.Boundary}></div>
        {/* 첨부서류 확인 섹션 */}
        <section className="section3">
          <div className={styles.sectionWrap3}>
            <p>첨부서류 확인</p>
            <ClaimDocumentsUpload
              previews={previews}
              setTotalFiles={setTotalFiles}
              setPreviews={setPreviews}
              setImageName={handleImageNameChange}
              collectionData={contextData}
              docCategories={claimDocCategories} // 일반 청구용 문서 카테고리 전달
            />

            {/* 첨부서류 확인 버튼 */}
            <div className={styles.btnFlex}>
              <button className={styles.firstBtn} onClick={openModal}>
                필요서류 첨부
              </button>
              <button
                className={styles.secondBtn}
                onClick={handleSendDocuments}
                style={{ opacity: totalFiles === 0 ? 0.4 : 1 }}
                disabled={totalFiles === 0}
              >
                서류 전송하기
              </button>
            </div>
          </div>
        </section>
      </div>
      {/* 파일 업로드 모달 */}
      {isModalOpen && (
        <UploadFileModal
          closeModal={closeModal}
          previews={previews}
          setPreviews={handleFileUpload}
          setImageName={handleImageNameChange}
          imageName={imageName}
          propsAccient_cuase_cd={propsAccient_cuase_cd}
          docCategories={claimDocCategories} // 일반 청구용 문서 카테고리 전달
        />
      )}
      {/* 성공 모달 */}
      {isSucceedModalOpen && (
        <ClaimSucceedModal
          arrayResultData={arrayResultData}
          onClose={closeSucceedModal}
          message="보험금 청구"
        />
      )}
      {/* 에러 모달 */}
      {isErrorModalOpen && (
        <ErrorModal
          message={errorMessage}
          subMsg={subErrorMessage}
          onClose={closeErrorModal}
        />
      )}
      {isLoading && <Loading />}
    </>
  );
}

export default ClaimDocumentSend;
