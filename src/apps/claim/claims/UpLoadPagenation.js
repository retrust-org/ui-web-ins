import React, { useRef, useEffect, useState } from "react";
import styles from "../../../css/claim/claimUpLoadPagenation.module.css";
import commonX from "../../../assets/commonX.svg";
import rigth from "../../../assets/commonRightArrow.svg";

function UpLoadPagenation({
  onClose,
  fileType,
  imageSrcs,
  currentImageIndex,
  onDelete,
}) {
  const contentRef = useRef(null);
  const imageRef = useRef(null);
  const [currentIndex, setCurrentIndex] = useState(currentImageIndex);
  const totalImages = imageSrcs?.length || 0;

  useEffect(() => {
    // 컨텐츠 참조가 있는지 확인 후 내용 설정
    if (contentRef.current) {
      // 파일 타입에 따라 설명 텍스트 설정
      switch (fileType) {
        case "보험금 청구서":
          contentRef.current.innerText = "보험금 청구서 내용";
          break;
        case "개인(신용)정보처리동의서":
          contentRef.current.innerText = "개인(신용)정보처리동의서 내용";
          break;
        case "위임장":
          contentRef.current.innerText = "위임장 내용";
          break;
        case "사고경위서":
          contentRef.current.innerText = "사고경위서 내용";
          break;
        case "진료비 계산 영수증":
          contentRef.current.innerText = "진료비 계산 영수증 내용";
          break;
        case "진료비 세부내역서":
          contentRef.current.innerText = "진료비 세부내역서 내용";
          break;
        case "진단서":
          contentRef.current.innerText = "진단서 내용";
          break;
        default:
          contentRef.current.innerText = "첨부 서류 미리보기";
          break;
      }
    }

    // 이미지 소스 설정 (이미지 참조와 이미지 소스가 있는지 확인)
    if (imageRef.current && imageSrcs && imageSrcs.length > 0) {
      imageRef.current.src = imageSrcs[currentIndex];
    }
  }, [fileType, imageSrcs, currentIndex]);

  const handlePrev = () => {
    if (!totalImages) return;
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : totalImages - 1
    );
  };

  const handleNext = () => {
    if (!totalImages) return;
    setCurrentIndex((prevIndex) =>
      prevIndex < totalImages - 1 ? prevIndex + 1 : 0
    );
  };

  const handleDelete = () => {
    if (onDelete && typeof onDelete === "function") {
      onDelete(currentIndex);
    }
    onClose();
  };

  // 이미지 파일 확장자 확인
  const isPdfFile = () => {
    if (!imageSrcs || !imageSrcs[currentIndex]) return false;

    const url = imageSrcs[currentIndex];
    // 'blob:' 프로토콜을 사용한 URL에서는 파일 확장자를 직접 확인할 수 없으므로
    // 파일 이름에 'pdf'가 포함되었는지 또는 MIME 타입을 확인하는 방식이 필요할 수 있음
    // 여기서는 간단히 URL에 'pdf'가 포함되었는지만 확인
    return url.toLowerCase().includes("pdf");
  };

  return (
    <div className={styles.backdrop}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>미리보기</h3>
          <img
            src={commonX}
            alt="닫기"
            className={styles.closeIcon}
            onClick={onClose}
          />
        </div>
        <div className={styles.content}>
          <div className={styles.contentWrap}>
            <span ref={contentRef}></span>
            {isPdfFile() ? (
              <div className={styles.pdfPreview}>
                <p>PDF 파일은 미리보기를 지원하지 않습니다.</p>
                <p>파일명: {imageSrcs[currentIndex].split("/").pop()}</p>
              </div>
            ) : (
              <img
                ref={imageRef}
                alt="미리보기"
                className={styles.previewImages}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src =
                    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100'%3E%3Crect width='100' height='100' fill='%23f0f0f0'/%3E%3Ctext x='50%' y='50%' font-family='Arial' font-size='14' text-anchor='middle' dominant-baseline='middle' fill='%23999'%3E이미지 로드 실패%3C/text%3E%3C/svg%3E";
                }}
              />
            )}
            <div className={styles.pagination}>
              <div onClick={handlePrev}>
                <img
                  src={rigth}
                  alt="이전"
                  className={styles.rightBtn}
                  style={{ transform: "rotate(180deg)" }}
                />
              </div>
              <div>
                <span>
                  {currentIndex + 1} / {totalImages}
                </span>
              </div>
              <div onClick={handleNext}>
                <img src={rigth} alt="다음" className={styles.leftBtn} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.btnWrap}>
          <button onClick={handleDelete}>삭제</button>
          <button onClick={onClose}>확인</button>
        </div>
      </div>
    </div>
  );
}

export default UpLoadPagenation;
