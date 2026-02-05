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

// 진료비 계산 영수증, 진료비 세부내역서, 진단서
function ClaimDocuments() {
  
  const { navigateToHome } = useHomeNavigate();
  // Context에서 모든 데이터 가져오기
  const { claimData, insuredData, typeSelectedData, acceptData } =
    useClaimUploadContext();
  const propsAccient_cuase_cd = typeSelectedData.accident_cause_cd;

  // typeSelectedData에서 필요한 값들 추출 및 콘솔 출력
  useEffect(() => {
    console.log("=== ClaimDocuments에서 typeSelectedData 확인 ===");
    console.log("accident_cause_cd:", typeSelectedData.accidentCauseKey);
    console.log("claim_type:", typeSelectedData.claimTypeKey);
    console.log("전체 typeSelectedData:", typeSelectedData);
    console.log("전체 claimData:", claimData);
    console.log("전체 insuredData:", insuredData);
    console.log("전체 acceptData:", acceptData);
  }, [typeSelectedData, claimData, insuredData, acceptData]);

  // 의료비 청구용 문서 카테고리 정의
  const medicalDocCategories = [
    "진료비 계산 영수증",
    "진료비 세부내역서",
    "진단서",
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previews, setPreviews] = useState([[], [], []]); // 미리보기 이미지 상태 (3개 카테고리)
  const [isSucceedModalOpen, setIsSucceedModalOpen] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [imageName, setImageName] = useState([]); // 파일 이름 배열
  const [totalFiles, setTotalFiles] = useState(0); // 숫자 타입으로 초기화
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

    console.log("=== API 전송 전 데이터 확인 ===");
    console.log("사용할 accident_cause_cd:", typeSelectedData.accidentCauseKey);
    console.log("사용할 claim_type:", typeSelectedData.claimTypeKey);

    setIsLoading(true);

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    // 파일명 배열 확인 및 정제
    const cleanFileList = imageName.map((filename) => {
      // 경로가 포함된 경우 제거
      return filename.includes("/") ? filename.split("/").pop() : filename;
    });

    // Context에서 모든 데이터를 통합하여 API 요청 데이터 생성
    const claimRequestData = {
      // 날짜 정보 (claimData)
      accident_date: claimData.accident_date || "", // 선택한날짜 (청구날짜)

      // 피보험자 정보 (insuredData)
      encryptedKey: insuredData.encryptedRRN?.encryptedKey || "", // 피보험자 암호화된 주민번호
      iv: insuredData.encryptedRRN?.iv || "", // 피보험자 암호화된 주민번호
      encryptedData: insuredData.encryptedRRN?.encryptedData || "", // 피보험자 암호화된 주민번호
      submitter_name: insuredData.personName || "", // 피보험자 이름

      // 청구 유형 정보 (typeSelectedData) - 수정된 부분
      submission_type: typeSelectedData.claimType || "", // 신규,추가
      claim_type: typeSelectedData.claimTypeKey || "", // 사고 종류 코드 (claimTypeKey 사용)
      accident_cause_cd: typeSelectedData.accidentCauseKey || "", // 사고 원인 코드 (accidentCauseKey 사용)

      // 사고 접수 정보 (acceptData)
      accident_details: acceptData.text || "", // 텍스트

      // 연락처 정보
      contect_channel_cd: "23",
      area_telecom_cd: acceptData.arCcoCd1 || "", // 휴대폰앞자리
      phone_exchange_cd: acceptData.telofNo1 || "", // 휴대폰 2번째자리
      phone_serial_cd: acceptData.telSno1 || "", // 휴대폰 3번째자리리

      // 계좌 정보
      bank_cd: acceptData.selectedBankCd || "", // 은행코드
      bank_name: acceptData.selectedBank || "", // 선택된 은행
      accountEncryptedKey: acceptData.accountEncryptedKey || "", // 피보험자 암호화된 계좌
      accountIv: acceptData.accountIv || "", // 피보험자 암호화된 계좌
      accountEncryptedData: acceptData.accountEncryptedData || "", // 피보험자 암호화된 계좌
      depositor_name: acceptData.accountHolderName || "", // 예금주

      // 관계 정보
      depositor_relation_cd: acceptData.relationCd || "", // 관계

      // 예금주 주민번호 (관계가 본인이 아닌 경우)
      depositorEncryptedKey: acceptData.depositorEncryptedKey || null, // 관계코드없을 경우 null
      depositorIv: acceptData.depositorIv || null, // 관계코드없을 경우 null
      depositorEncryptedData: acceptData.depositorEncryptedData || null, // 관계코드없을 경우 null

      // 파일 정보 - 배열로 전송 (수정됨)
      file_list: cleanFileList, // 경로가 제거된 순수 파일명 배열
      file_quatity: totalFiles.toString(), // 파일 개수를 문자열로 변환
    };

    console.log("=== 최종 API 요청 데이터 ===");
    console.log("claim_type:", claimRequestData.claim_type);
    console.log("accident_cause_cd:", claimRequestData.accident_cause_cd);
    console.log("전체 요청 데이터:", claimRequestData);

    const raw = JSON.stringify(claimRequestData);

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow",
    };

    try {
      const response = await fetch(
        `${process.env.REACT_APP_BASE_URL}/trip-api/accident`,
        requestOptions
      );

      if (!response.ok) {
        // 실패 응답 상세 확인
        const errorText = await response.text();
        console.error("서버 오류 응답:", errorText);
        throw new Error(`서버 오류: ${response.status}, 상세: ${errorText}`);
      }

      const result = await response.json();

      if (result.errCd === "00001") {
        setArrayResultData(result);
        setIsSucceedModalOpen(true); // 모달 열기
      } else {
        let errorMessage = "서류 전송에 실패했습니다.";
        if (result.errMsg) {
          errorMessage += ` (${result.errMsg})`;
        }
        setErrorMessage(errorMessage);
        setIsErrorModalOpen(true);
      }
    } catch (error) {
      console.error("오류 발생:", error);
      setErrorMessage(`서류 전송 중 오류가 발생했습니다: ${error.message}`);
      setIsErrorModalOpen(true); // 에러 모달 열기
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

  // 파일 이름 처리 핸들러 (UploadFileModal에서 호출됨)
  const handleImageNameChange = (newImageNames) => {
    setImageName(newImageNames); // 배열로 받아서 저장
  };

  const closeSucceedModal = () => {
    setIsSucceedModalOpen(false);
    // 성공 후 처리 (예: 홈으로 이동)
    navigateToHome();
  };

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
  };

  // 모든 컨텍스트 데이터를 통합한 객체 생성 (ClaimDocumentsUpload와 UploadFileModal에 전달)
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
          <ClaimDocAccordion />
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
              setImageName={handleImageNameChange} // 수정된 핸들러 사용
              collectionData={contextData} // 통합된 Context 데이터 전달
              docCategories={medicalDocCategories} // 의료비 청구용 문서 카테고리 전달
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
          setImageName={handleImageNameChange} // 수정된 핸들러 사용
          imageName={imageName}
          propsAccient_cuase_cd={propsAccient_cuase_cd}
          docCategories={medicalDocCategories} // 의료비 청구용 문서 카테고리 전달
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
        <ErrorModal message={errorMessage} onClose={closeErrorModal} />
      )}
      {isLoading && <Loading />}
    </>
  );
}

export default ClaimDocuments;
