import React, { useEffect, useState } from "react";
import styles from "../../../css/claim/claimDocuments.module.css";
import selectedPreview from "../../../assets/selectedPreview.svg";
import claimDeleteBtn from "../../../assets/claimDeleteBtn.svg";
import UpLoadPagenation from "./UpLoadPagenation";

function ClaimDocumentsUpload({
  previews,
  setTotalFiles,
  setPreviews,
  setImageName,
  collectionData,
  docCategories = [], // 빈 배열로 기본값 설정
}) {
  const [modalOpenIndex, setModalOpenIndex] = useState(null);
  const [modalFileType, setModalFileType] = useState("");
  const [modalImageSrcs, setModalImageSrcs] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const calculateTotalFiles = () => {
    let total = 0;
    previews.forEach((previewList) => {
      if (previewList) {
        // null 체크 추가
        total += previewList.length;
      }
    });
    return total;
  };

  useEffect(() => {
    const totalFiles = calculateTotalFiles();
    setTotalFiles(totalFiles);
  }, [previews, setTotalFiles]);

  // 모달 열기 함수
  const modalOpen = (fileType, imageSrcs, index, fileIdx) => {
    setModalFileType(fileType);
    setModalImageSrcs(imageSrcs);
    setCurrentImageIndex(fileIdx);
    setModalOpenIndex(index);
  };

  // 모달 닫기 함수
  const modalClose = () => {
    setModalOpenIndex(null);
  };

  // 파일 삭제 함수
  const fileDelete = (index, fileIndex) => {
    const updatedPreviews = [...previews];

    // index가 배열 범위를 벗어나는 경우 처리
    if (index >= updatedPreviews.length || !updatedPreviews[index]) {
      console.error("Invalid index or preview array:", index);
      return;
    }

    updatedPreviews[index] = previews[index].filter(
      (_, idx) => idx !== fileIndex
    );
    setPreviews(updatedPreviews);

    // 전체 파일 목록에서 올바른 파일을 찾아 삭제
    const totalFilesBeforeIndex = previews
      .slice(0, index)
      .reduce((acc, curr) => acc + (curr ? curr.length : 0), 0);
    const globalFileIndex = totalFilesBeforeIndex + fileIndex;

    setImageName((prevImageName) => {
      const newImageName = [...prevImageName];
      newImageName.splice(globalFileIndex, 1);
      return newImageName;
    });
  };

  return (
    <div className={styles.FileToUploadContents}>
      <span className={styles.subtitle}>
        하단의 필요서류 첨부 버튼을 눌러서 (해당서류)를 업로드 해주세요
      </span>

      {docCategories.map((title, idx) => (
        <div className={styles.uploadFiles} key={idx}>
          <span>{title}</span>
          <div className={styles.previewContents}>
            {!previews[idx] || previews[idx].length === 0
              ? null
              : previews[idx].map((preview, fileIdx) => (
                  <div className={styles.previewContentsImages} key={fileIdx}>
                    {fileIdx === 0 && (
                      <div className={styles.empty}>
                        <img
                          src={selectedPreview}
                          alt="전체보기"
                          onClick={() =>
                            modalOpen(title, previews[idx], idx, fileIdx)
                          }
                        />
                      </div>
                    )}
                    <div className={styles.empty}>
                      <img
                        src={preview}
                        alt="preview"
                        className={styles.previewImage}
                      />
                      <div
                        className={styles.deleteButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          fileDelete(idx, fileIdx);
                        }}
                      >
                        <img src={claimDeleteBtn} alt="delete" />
                      </div>
                    </div>
                  </div>
                ))}
          </div>
        </div>
      ))}

      {modalOpenIndex !== null && (
        <UpLoadPagenation
          onClose={modalClose}
          fileType={modalFileType}
          imageSrcs={modalImageSrcs}
          currentImageIndex={currentImageIndex}
          onDelete={(fileIndex) => fileDelete(modalOpenIndex, fileIndex)}
        />
      )}
    </div>
  );
}

export default ClaimDocumentsUpload;
