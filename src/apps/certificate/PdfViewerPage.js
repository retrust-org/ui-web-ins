// PdfViewerPage.js
import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import styles from "../../css/certificate/pageViewer.module.css";
import Loading from "../../components/loadings/Loadings";

function PdfViewerPage() {
  const { group_no } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [pdfData, setPdfData] = useState(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // 모바일 디바이스 감지
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    const isMobileDevice =
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        userAgent
      );
    setIsMobile(isMobileDevice);

    // URL에서 state로 전달된 pdfBlob 확인
    const pdfBlob = location.state?.pdfBlob;

    if (!pdfBlob) {
      console.log("pdf데이터가 존재하지 않습니다");
      return;
    }

    // 모바일 기기에서는 다운로드 진행
    if (isMobileDevice) {
      const downloadFile = () => {
        // API 응답 헤더에서 추출한 파일명 사용
        const fileName = location.state?.fileName || `보험증명서_${new Date()
          .toISOString()
          .slice(0, 15)}.pdf`;

        // a 태그를 사용한 다운로드
        const url = URL.createObjectURL(pdfBlob);
        const a = document.createElement("a");
        a.href = url;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();

        // 메모리 정리
        setTimeout(() => {
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
          // 다운로드 후 원래 페이지로 돌아가기
          navigate(`/${group_no}`);
        }, 100);
      };

      // 약간의 지연 후 다운로드 실행
      setTimeout(downloadFile, 500);
    } else {
      // PC에서는 뷰어 표시
      // blob을 base64로 변환
      const reader = new FileReader();
      reader.readAsDataURL(pdfBlob);
      reader.onloadend = () => {
        const base64data = reader.result;
        setPdfData(base64data);
      };

      // 문서 전체 스타일 임시 변경
      document.body.style.overflow = "hidden";
      document.body.style.margin = "0";
      document.body.style.padding = "0";
    }

    // 컴포넌트 언마운트 시 스타일 복원
    return () => {
      document.body.style.overflow = "";
      document.body.style.margin = "";
      document.body.style.padding = "";
    };
  }, [location.state, group_no, navigate]);

  // Escape 키를 누르면 뒤로 가기
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        navigate(`/${group_no}`);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [navigate, group_no]);

  // 모바일에서는 다운로드만 진행하므로 로딩만 표시
  if (isMobile) {
    return (
      <div className={styles.pdfViewerContainer}>
        <div className={styles.downloadMessage}>
          <Loading />
          <p>PDF 파일 다운로드 중입니다. 잠시만 기다려주세요...</p>
        </div>
      </div>
    );
  }

  // PC에서는 PDF 뷰어 표시
  return (
    <div className={styles.pdfViewerContainer}>
      {pdfData ? (
        <div className={styles.pdfContent}>
          {/* 기본 iframe 방식 - 데스크톱에서 작동 */}
          <iframe
            src={pdfData}
            title="보험 가입증명서"
            className={styles.pdfFrame}
          />

          {/* 대체 방식 - iframe이 작동하지 않을 경우 */}
          <div className={styles.fallbackContainer}>
            <object
              data={pdfData}
              type="application/pdf"
              className={styles.objectPdf}
            >
              {/* 최종 대체 방식 */}
              <embed
                src={pdfData}
                type="application/pdf"
                className={styles.embedPdf}
              />
            </object>
          </div>
        </div>
      ) : (
        <Loading />
      )}
    </div>
  );
}

export default PdfViewerPage;
