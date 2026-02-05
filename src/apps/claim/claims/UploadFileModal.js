import React, { useState, useRef, useEffect } from "react";
import styles from "../../../css/claim/claimUploadModal.module.css";
import commonX from "../../../assets/commonX.svg";
import claimModalFileUpload from "../../../assets/claimModalFileUpload.svg";
import claimDocFileUpload from "../../../assets/claimDocFileUpload.svg";
import claimDeleteBtn from "../../../assets/claimDeleteBtn.svg";
import Button from "../../../components/buttons/Button";
import Loading from "../../../components/loadings/Loading";
import ErrorModal from "../../../components/modals/ErrorModal";
import { useClaimUploadContext } from "../../../context/ClaimUploadContext";

function UploadFileModal({
  closeModal,
  previews,
  setPreviews,
  setImageName,
  propsAccient_cuase_cd, // 기존 props 유지 (하위 호환성)
  docCategories = [], // 빈 배열로 기본값 설정
}) {
  // Context에서 typeSelectedData 가져오기
  const { typeSelectedData } = useClaimUploadContext();

  // Context에서 올바른 accident_cause_cd 값 사용 (fallback으로 props 값 사용)
  const accidentCauseCd =
    typeSelectedData.accidentCauseKey || propsAccient_cuase_cd;

  const [pendingPreviews, setPendingPreviews] = useState(previews);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [fileUploadResults, setFileUploadResults] = useState([]); // 업로드 결과 저장용

  // 문서 카테고리 수에 맞게 refs 생성
  const fileInputRefs = useRef(
    Array(docCategories.length)
      .fill()
      .map(() => React.createRef())
  );

  useEffect(() => {
    setPendingPreviews(previews);
  }, [previews]);

  useEffect(() => {
    if (filesToUpload.length > 0) {
      setUploading(true);
      setIsLoading(true);

      // 파일 하나씩 순차적으로 업로드하는 방식으로 변경
      uploadFilesSequentially(filesToUpload)
        .catch((error) => {
          console.error("파일 업로드 오류:", error);
          setErrorMessage(
            `파일 업로드 중 오류가 발생했습니다: ${error.message}`
          );
          setIsErrorModalOpen(true);
        })
        .finally(() => {
          setFilesToUpload([]);
          setUploading(false);
          setIsLoading(false);
        });
    }
  }, [filesToUpload]);

  // 파일을 순차적으로 업로드하는 함수 (개선됨)
  const uploadFilesSequentially = async (files) => {
    const uploadResults = [];

    for (const { file, accidentCauseCd } of files) {
      try {
        const filename = await uploadFileToServer(file, accidentCauseCd);

        if (filename) {
          uploadResults.push(filename);
        }
      } catch (error) {
        console.error("파일 업로드 실패:", file.name, error.message);
        // 개별 파일 실패해도 계속 진행하지 않고 전체 실패로 처리
        throw error;
      }
    }

    // 모든 파일 업로드 완료 후 현재 이미지 이름 목록에 추가
    if (uploadResults.length > 0) {
      setFileUploadResults((prev) => [...prev, ...uploadResults]);
      setImageName((prev) => [...prev, ...uploadResults]);
    }

    return uploadResults;
  };

  const uploadFileToServer = (file, accidentCauseCd) => {
    return new Promise((resolve, reject) => {
      const formData = new FormData();
      formData.append("accident_cause_cd", accidentCauseCd);
      formData.append("file", file, file.name);

      // AbortController로 타임아웃 처리
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, 20000); // 2분 타임아웃

      fetch(`${process.env.REACT_APP_BASE_URL}/trip-api/upload`, {
        method: "POST",
        body: formData,
        signal: controller.signal,
        redirect: "follow",
      })
        .then((response) => {
          clearTimeout(timeoutId);

          if (!response.ok) {
            if (response.status === 408) {
              throw new Error('네트워크 환경이 좋지 않습니다. 다시 시도해주세요.');
            } else if (response.status === 413) {
              throw new Error('파일 크기가 너무 큽니다.');
            } else if (response.status === 400) {
              throw new Error('잘못된 파일 형식입니다.');
            } else {
              throw new Error(`업로드 실패 (상태 코드: ${response.status})`);
            }
          }
          return response.json();
        })
        .then((data) => {
          if (data && data.Filename) {
            resolve(data.Filename);
          } else if (data && data.filename) {
            resolve(data.filename);
          } else {
            reject(new Error("서버 응답에 파일명이 없습니다."));
          }
        })
        .catch((error) => {
          clearTimeout(timeoutId);

          if (error.name === 'AbortError') {
            reject(new Error("네트워크 환경이 좋지 않습니다. 다시 시도해주세요."));
          } else {
            reject(error);
          }
        });
    });
  };

  const handleFileChange = (index, e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    const newPreviews = files.map((file) => URL.createObjectURL(file));

    // 현재 pendingPreviews 배열 길이가 충분한지 확인
    const updatedPendingPreviews = [...pendingPreviews];
    // index가 배열 범위를 벗어나는 경우 확장
    while (updatedPendingPreviews.length <= index) {
      updatedPendingPreviews.push([]);
    }

    updatedPendingPreviews[index] = [
      ...updatedPendingPreviews[index],
      ...newPreviews,
    ];
    setPendingPreviews(updatedPendingPreviews);

    const newFilesToUpload = files.map((file) => ({
      file,
      accidentCauseCd: accidentCauseCd, // Context에서 가져온 값 사용
    }));

    setFilesToUpload((prevFilesToUpload) => [
      ...prevFilesToUpload,
      ...newFilesToUpload,
    ]);
  };

  const openFileUpload = (index) => {
    fileInputRefs.current[index].current.click();
  };

  const handleFileDelete = (index, fileIndex) => {
    const updatedPendingPreviews = [...pendingPreviews];

    // index가 배열 범위를 벗어나는 경우 처리
    if (index >= updatedPendingPreviews.length) {
      console.error("Invalid index:", index);
      return;
    }

    updatedPendingPreviews[index] = pendingPreviews[index].filter(
      (_, idx) => idx !== fileIndex
    );
    setPendingPreviews(updatedPendingPreviews);
    setPreviews(updatedPendingPreviews);

    // 전체 파일 목록에서 올바른 파일을 찾아 삭제
    const totalFilesBeforeIndex = pendingPreviews
      .slice(0, index)
      .reduce((acc, curr) => acc + (curr ? curr.length : 0), 0);
    const globalFileIndex = totalFilesBeforeIndex + fileIndex;

    // 서버 파일명 배열에서도 해당 인덱스 삭제
    setImageName((prevImageName) => {
      const newImageName = [...prevImageName];
      newImageName.splice(globalFileIndex, 1);
      return newImageName;
    });

    // 업로드 결과 배열에서도 삭제
    setFileUploadResults((prev) => {
      const newResults = [...prev];
      newResults.splice(globalFileIndex, 1);
      return newResults;
    });
  };

  const handleConfirm = () => {
    if (!uploading) {
      setPreviews(pendingPreviews);
      closeModal();
    } else {
      alert("파일 업로드가 완료될 때까지 기다려주세요.");
    }
  };

  const closeErrorModal = () => {
    setIsErrorModalOpen(false);
  };

  return (
    <>
      {isLoading && <Loading />}
      <div className={styles.modalOverlay}>
        <div className={styles.modalContent}>
          <div className={styles.modalContentTitle}>
            <p>필요서류 첨부</p>
            <button className={styles.closeButton} onClick={closeModal}>
              <img src={commonX} alt="close" />
            </button>
          </div>
          <h3>항목별 서류 파일을 첨부해주세요.</h3>
          <div className={styles.uploadListWrap}>
            {docCategories.map((title, idx) => (
              <div className={styles.uploadList} key={idx}>
                <p>{title}</p>
                <div className={styles.overflowContents}>
                  <div className={styles.ImagesWrap}>
                    {!pendingPreviews[idx]?.length ? (
                      <img
                        src={claimModalFileUpload}
                        alt="upload icon"
                        className={styles.uploadIcon}
                        onClick={() => openFileUpload(idx)}
                      />
                    ) : (
                      <div className={styles.imagesContents}>
                        <div className={styles.imagesFlex}>
                          <img
                            src={claimDocFileUpload}
                            alt="upload icon"
                            onClick={() => openFileUpload(idx)}
                          />
                          <div className={styles.imagesWrap}>
                            {pendingPreviews[idx]?.map((preview, fileIdx) => (
                              <div
                                key={fileIdx}
                                className={styles.previewContainer}
                              >
                                <img src={preview} alt="preview" />
                                <div
                                  className={styles.deleteButton}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFileDelete(idx, fileIdx);
                                  }}
                                >
                                  <img src={claimDeleteBtn} alt="delete" />
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <input
                  type="file"
                  onChange={(e) => handleFileChange(idx, e)}
                  accept=".jpg,.jpeg,.png,.pdf" // PDF도 허용
                  ref={fileInputRefs.current[idx]}
                  className={styles.input}
                  multiple
                  key={`file-input-${idx}`}
                />
              </div>
            ))}
          </div>
          <Button buttonText="확인" onClick={handleConfirm} />
        </div>
      </div>

      {/* 에러 모달 */}
      {isErrorModalOpen && (
        <ErrorModal message={errorMessage} onClose={closeErrorModal} />
      )}
    </>
  );
}

export default UploadFileModal;