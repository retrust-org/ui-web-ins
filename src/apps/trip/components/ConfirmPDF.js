import React, { useState, useEffect } from "react";
import ConfirmNotice from "../components/ConfirmNotice";
import confirmPDF_1 from "../../../assets/confirmPDF_1.svg";
import confirmPDF_2 from "../../../assets/confirmPDF_2.svg";
import styles from "../../../css/common/confirmPDF.module.css";

function ConfirmPDF() {
  // 모바일 환경 감지를 위한 상태
  const [isMobile, setIsMobile] = useState(false);

  // 컴포넌트 마운트 시 모바일 환경 감지
  useEffect(() => {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileDevice =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
    setIsMobile(isMobileDevice);
  }, []);

  // 보험약관 URL 가져오기 함수
  const getTermsUrl = () => {
    return window.productApiData?.data?.masterPolicies?.[0]?.terms_url || "";
  };

  // 상품설명서 URL 가져오기 함수
  const getProductGuideUrl = () => {
    return window.productApiData?.data?.masterPolicies?.[0]?.product_guide_url || "";
  };

  // PDF 다운로드 또는 열기 함수
  const handlePdfAction = (url, fileName) => {
    if (!url) {
      console.error("PDF URL이 제공되지 않았습니다.");
      return;
    }

    if (isMobile) {
      // 모바일에서는 직접 다운로드하여 기기의 기본 앱으로 열기 유도
      fetch(url)
        .then((response) => {
          if (!response.ok) {
            throw new Error("PDF를 가져오는데 실패했습니다.");
          }
          return response.blob();
        })
        .then((blob) => {
          const url = URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = fileName || "document.pdf"; // 파일명이 없으면 기본값 설정
          document.body.appendChild(a);
          a.click();

          // 메모리 정리
          setTimeout(() => {
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }, 100);
        })
        .catch((error) => {
          console.error("PDF 다운로드 오류:", error);
          // 오류 발생 시 대체 방법으로 새 창에서 열기
          window.open(url, "_blank");
        });
    } else {
      // PC에서는 새 창에서 PDF 열기
      window.open(url, "_blank");
    }
  };

  return (
    <>
      <div className={styles.confirmContents}>
        <div
          className={styles.PDF_style}
          onClick={() =>
            handlePdfAction(getProductGuideUrl(), "상품설명서.pdf")
          }
        >
          상품설명서(PDF)
          <img src={confirmPDF_1} alt="pdf1" />
        </div>

        <div
          className={styles.PDF_style}
          onClick={() => handlePdfAction(getTermsUrl(), "보험약관.pdf")}
        >
          보험약관(PDF)
          <img src={confirmPDF_2} alt="pdf2" />
        </div>
      </div>
      <ConfirmNotice />
    </>
  );
}

export default ConfirmPDF;
